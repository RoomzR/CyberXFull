using System.Collections.Concurrent;
using System.Text.Json;
using CyberX.Data.Persistence;
using CyberX.Data.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace CyberX.WebApi.Services.Gsi;

public sealed class GsiStore(IServiceScopeFactory scopeFactory, ILogger<GsiStore> logger)
{
    private readonly ConcurrentDictionary<string, LiveServerState> _live = new();
    private readonly ConcurrentDictionary<string, string> _activeMap = new(); // token -> current map name
    private readonly ConcurrentDictionary<int, DateTime> _blockedUntil = new(); // serverId -> suppress match tracking

    public LiveServerState? GetByToken(string token) =>
        _live.TryGetValue(token, out var s) ? s : null;

    public IEnumerable<LiveServerState> GetAllLive() => _live.Values;

    public async Task ProcessAsync(string token, JsonElement payload, CancellationToken ct = default)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<CyberXDbContext>();

        var server = await db.GameServers
            .Include(s => s.Pc)
            .FirstOrDefaultAsync(s => s.GsiToken == token && s.IsActive, ct);

        if (server is null)
        {
            logger.LogWarning("GSI from unknown token: {Token}", token[..Math.Min(8, token.Length)]);
            return;
        }

        var now = DateTime.UtcNow;
        var state = _live.GetOrAdd(token, _ => new LiveServerState
        {
            ServerId   = server.Id,
            ServerName = server.Name,
            LinkedPc   = server.Pc?.Number,
        });

        state.ServerName = server.Name;
        state.LinkedPc   = server.Pc?.Number;
        state.IsOnline   = true;
        state.LastGsiAt  = now;

        // Admin cleared live — keep server online but ignore match payloads for a while
        if (IsBlocked(server.Id))
        {
            state.Match = null;
            return;
        }

        if (!payload.TryGetProperty("map", out var mapEl))
            return;

        var mapName  = mapEl.TryGetProperty("name", out var mn) ? mn.GetString() ?? "unknown" : "unknown";
        var mapPhase = mapEl.TryGetProperty("phase", out var mp) ? mp.GetString() ?? "live" : "live";
        var mode     = mapEl.TryGetProperty("mode", out var md) ? md.GetString() ?? "competitive" : "competitive";
        var round    = mapEl.TryGetProperty("round", out var rd) ? rd.GetInt32() : 0;

        var scoreCt = 0; var scoreT = 0;
        var ctName = "Counter-Terrorists"; var tName = "Terrorists";
        if (mapEl.TryGetProperty("team_ct", out var ctEl))
        {
            if (ctEl.TryGetProperty("score", out var sc)) scoreCt = sc.GetInt32();
            if (ctEl.TryGetProperty("name", out var cn) && !string.IsNullOrWhiteSpace(cn.GetString()))
                ctName = cn.GetString()!;
        }
        if (mapEl.TryGetProperty("team_t", out var tEl))
        {
            if (tEl.TryGetProperty("score", out var st)) scoreT = st.GetInt32();
            if (tEl.TryGetProperty("name", out var tn) && !string.IsNullOrWhiteSpace(tn.GetString()))
                tName = tn.GetString()!;
        }

        var roundPhase = "live";
        string? bombState = null;
        if (payload.TryGetProperty("round", out var roundEl))
        {
            if (roundEl.TryGetProperty("phase", out var rp)) roundPhase = rp.GetString() ?? "live";
            if (roundEl.TryGetProperty("bomb", out var bm)) bombState = bm.GetString();
        }

        // New map started — finalize previous match if any
        var prevMap = _activeMap.GetValueOrDefault(token);
        if (prevMap is not null && prevMap != mapName && state.Match is not null)
            await FinalizeMatchAsync(db, state.Match.MatchId, scoreCt, scoreT, round, ct);

        _activeMap[token] = mapName;

        // Map ended
        if (mapPhase is "gameover" or "intermission")
        {
            if (state.Match is not null)
            {
                await FinalizeMatchAsync(db, state.Match.MatchId, scoreCt, scoreT, round, ct);
                state.Match = null;
            }
            return;
        }

        // Ensure DB match record exists
        var match = await db.Matches
            .FirstOrDefaultAsync(m => m.ServerId == server.Id && m.Status == "live", ct);

        if (match is null)
        {
            match = new MatchRecord
            {
                ServerId    = server.Id,
                MapName     = mapName,
                Mode        = mode,
                TeamCtName  = ctName,
                TeamTName   = tName,
                ScoreCt     = scoreCt,
                ScoreT      = scoreT,
                TotalRounds = round,
                Status      = "live",
                StartedAt   = now,
            };
            db.Matches.Add(match);
            await db.SaveChangesAsync(ct);
        }
        else if (match.MapName != mapName)
        {
            await FinalizeMatchAsync(db, match.Id, match.ScoreCt, match.ScoreT, match.TotalRounds, ct);
            match = new MatchRecord
            {
                ServerId    = server.Id,
                MapName     = mapName,
                Mode        = mode,
                TeamCtName  = ctName,
                TeamTName   = tName,
                ScoreCt     = scoreCt,
                ScoreT      = scoreT,
                TotalRounds = round,
                Status      = "live",
                StartedAt   = now,
            };
            db.Matches.Add(match);
            await db.SaveChangesAsync(ct);
        }
        else
        {
            match.ScoreCt     = scoreCt;
            match.ScoreT      = scoreT;
            match.TotalRounds = round;
            match.TeamCtName  = ctName;
            match.TeamTName   = tName;
            await db.SaveChangesAsync(ct);
        }

        var incoming = ParsePlayers(payload, now);
        var players  = MergePlayerRoster(state.Match, match.Id, incoming, payload, now);
        await UpsertPlayerStatsAsync(db, match.Id, players, ct);

        state.Match = new LiveMatchState
        {
            MatchId     = match.Id,
            MapName     = mapName,
            Mode        = mode,
            MapPhase    = mapPhase,
            RoundPhase  = roundPhase,
            Round       = round,
            ScoreCt     = scoreCt,
            ScoreT      = scoreT,
            TeamCtName  = ctName,
            TeamTName   = tName,
            BombState   = bombState,
            StartedAt   = match.StartedAt,
            UpdatedAt   = now,
            Players     = players,
        };
    }

    /// <summary>
    /// Dedicated sends allplayers (full roster). Each client sends only "player" — merge by steamid across POSTs.
    /// </summary>
    private static List<LivePlayerState> MergePlayerRoster(
        LiveMatchState? existingMatch,
        int matchId,
        List<LivePlayerState> incoming,
        JsonElement payload,
        DateTime now)
    {
        if (PayloadHasAllPlayers(payload))
            return incoming;

        var roster = existingMatch?.MatchId == matchId
            ? existingMatch.Players.ToDictionary(p => p.SteamId, StringComparer.Ordinal)
            : new Dictionary<string, LivePlayerState>(StringComparer.Ordinal);

        foreach (var p in incoming)
            roster[p.SteamId] = p;

        const double staleSeconds = 120;
        return roster.Values
            .Where(p => (now - p.LastSeenAt).TotalSeconds <= staleSeconds)
            .OrderByDescending(p => p.Score)
            .ThenBy(p => p.Name)
            .ToList();
    }

    private static bool PayloadHasAllPlayers(JsonElement payload) =>
        payload.TryGetProperty("allplayers", out var all)
        && all.ValueKind == JsonValueKind.Object
        && all.EnumerateObject().MoveNext();

    private static List<LivePlayerState> ParsePlayers(JsonElement payload, DateTime now)
    {
        var dict = new Dictionary<string, LivePlayerState>(StringComparer.Ordinal);

        if (payload.TryGetProperty("allplayers", out var all) && all.ValueKind == JsonValueKind.Object)
        {
            foreach (var prop in all.EnumerateObject())
                dict[prop.Name] = ParseOnePlayer(prop.Name, prop.Value, now);
        }

        // Client GSI: only local player (merge across clients on backend by steamid)
        if (payload.TryGetProperty("player", out var single))
        {
            var sid = single.TryGetProperty("steamid", out var s) ? s.GetString() ?? "local" : "local";
            dict[sid] = ParseOnePlayer(sid, single, now);
        }

        return dict.Values.OrderByDescending(p => p.Score).ThenBy(p => p.Name).ToList();
    }

    internal static string NormalizeTeam(string? team)
    {
        if (string.IsNullOrWhiteSpace(team)) return "CT";
        var u = team.Trim().ToUpperInvariant();
        if (u.StartsWith("CT") || u.Contains("COUNTER")) return "CT";
        if (u.StartsWith('T') || u.Contains("TERROR")) return "T";
        return team.Trim();
    }

    internal static bool IsCtTeam(string team) => NormalizeTeam(team) == "CT";
    internal static bool IsTTeam(string team) => NormalizeTeam(team) == "T";

    private static LivePlayerState ParseOnePlayer(string steamId, JsonElement el, DateTime now)
    {
        var p = new LivePlayerState { SteamId = steamId, LastSeenAt = now };

        if (el.TryGetProperty("name", out var n)) p.Name = n.GetString() ?? steamId;
        if (el.TryGetProperty("team", out var t)) p.Team = NormalizeTeam(t.GetString());

        if (el.TryGetProperty("match_stats", out var ms))
        {
            if (ms.TryGetProperty("kills", out var k)) p.Kills = k.GetInt32();
            if (ms.TryGetProperty("deaths", out var d)) p.Deaths = d.GetInt32();
            if (ms.TryGetProperty("assists", out var a)) p.Assists = a.GetInt32();
            if (ms.TryGetProperty("mvps", out var m)) p.Mvps = m.GetInt32();
            if (ms.TryGetProperty("score", out var sc)) p.Score = sc.GetInt32();
            if (ms.TryGetProperty("headshot_kills", out var hk)) p.Headshots = hk.GetInt32();
            if (ms.TryGetProperty("damage", out var dm)) p.Damage = dm.GetInt32();
        }

        if (el.TryGetProperty("state", out var st))
        {
            if (st.TryGetProperty("health", out var h)) p.Health = h.GetInt32();
            if (st.TryGetProperty("armor", out var ar)) p.Armor = ar.GetInt32();
            if (st.TryGetProperty("money", out var mo)) p.Money = mo.GetInt32();
            if (st.TryGetProperty("helmet", out var hel)) p.HasHelmet = hel.ValueKind == JsonValueKind.True || (hel.ValueKind == JsonValueKind.Number && hel.GetInt32() > 0);
            if (st.TryGetProperty("round_killhs", out var hs)) p.Headshots = Math.Max(p.Headshots, hs.GetInt32());
            if (st.TryGetProperty("round_totaldmg", out var rd)) p.Damage = Math.Max(p.Damage, rd.GetInt32());
            p.Alive = p.Health > 0;
        }

        if (el.TryGetProperty("weapons", out var wps) && wps.ValueKind == JsonValueKind.Object)
        {
            foreach (var w in wps.EnumerateObject())
            {
                if (w.Value.TryGetProperty("state", out var ws) && ws.GetString() == "active")
                {
                    p.Weapon = w.Name;
                    break;
                }
            }
        }

        return p;
    }

    private static async Task UpsertPlayerStatsAsync(
        CyberXDbContext db, int matchId, List<LivePlayerState> players, CancellationToken ct)
    {
        var existing = await db.MatchPlayerStats
            .Where(s => s.MatchId == matchId)
            .ToListAsync(ct);

        foreach (var lp in players)
        {
            var row = existing.FirstOrDefault(e => e.SteamId == lp.SteamId);
            if (row is null)
            {
                db.MatchPlayerStats.Add(new MatchPlayerStatRecord
                {
                    MatchId    = matchId,
                    SteamId    = lp.SteamId,
                    PlayerName = lp.Name,
                    Team       = lp.Team,
                    Kills      = lp.Kills,
                    Deaths     = lp.Deaths,
                    Assists    = lp.Assists,
                    Mvps       = lp.Mvps,
                    Score      = lp.Score,
                    Headshots  = lp.Headshots,
                });
            }
            else
            {
                row.PlayerName = lp.Name;
                row.Team       = lp.Team;
                row.Kills      = lp.Kills;
                row.Deaths     = lp.Deaths;
                row.Assists    = lp.Assists;
                row.Mvps       = lp.Mvps;
                row.Score      = lp.Score;
                row.Headshots  = Math.Max(row.Headshots, lp.Headshots);
            }
        }

        await db.SaveChangesAsync(ct);
    }

    private static async Task FinalizeMatchAsync(
        CyberXDbContext db, int matchId, int scoreCt, int scoreT, int rounds, CancellationToken ct)
    {
        var match = await db.Matches.FindAsync([matchId], ct);
        if (match is null || match.Status == "completed") return;

        match.ScoreCt     = scoreCt;
        match.ScoreT      = scoreT;
        match.TotalRounds = rounds;
        match.Status      = "completed";
        match.EndedAt     = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public void MarkOffline(int serverId)
    {
        foreach (var kv in _live.Where(x => x.Value.ServerId == serverId))
        {
            kv.Value.IsOnline = false;
        }
    }

    /// <summary>Stop tracking a match in memory (admin delete/finish).</summary>
    public void ClearLiveMatch(int matchId)
    {
        foreach (var state in _live.Values)
        {
            if (state.Match?.MatchId == matchId)
                state.Match = null;
        }
    }

    public void ClearLiveForServer(int serverId)
    {
        foreach (var kv in _live.Where(x => x.Value.ServerId == serverId))
        {
            kv.Value.Match = null;
            _activeMap.TryRemove(kv.Key, out _);
        }
    }

    public bool IsBlocked(int serverId) =>
        _blockedUntil.TryGetValue(serverId, out var until) && until > DateTime.UtcNow;

    /// <summary>Admin force-clear: wipe in-memory match + block GSI from recreating it immediately.</summary>
    public bool ClearServerFully(int serverId, int blockMinutes = 5)
    {
        var hadGsiMatch = false;
        foreach (var kv in _live.Where(x => x.Value.ServerId == serverId).ToList())
        {
            if (kv.Value.Match is not null) hadGsiMatch = true;
            kv.Value.Match = null;
            _activeMap.TryRemove(kv.Key, out _);
        }

        if (blockMinutes > 0)
            _blockedUntil[serverId] = DateTime.UtcNow.AddMinutes(blockMinutes);

        return hadGsiMatch;
    }

    public void UnblockServer(int serverId) => _blockedUntil.TryRemove(serverId, out _);
}
