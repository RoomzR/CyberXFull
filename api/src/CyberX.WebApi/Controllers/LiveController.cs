using CyberX.Data.Persistence;
using CyberX.WebApi.Services.Gsi;
using CyberX.WebApi.Services.Stats;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CyberX.WebApi.Controllers;

[ApiController]
[Route("api/live")]
public sealed class LiveController(CyberXDbContext db, GsiStore store) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Overview()
    {
        var servers = await db.GameServers
            .Where(s => s.IsActive)
            .Include(s => s.Pc)
            .OrderBy(s => s.Name)
            .ToListAsync();

        var live = store.GetAllLive().ToDictionary(x => x.ServerId);

        var result = servers.Select(s =>
        {
            live.TryGetValue(s.Id, out var ls);
            var online = ls?.IsOnline == true &&
                         ls.LastGsiAt.HasValue &&
                         (DateTime.UtcNow - ls.LastGsiAt.Value).TotalSeconds < 45;

            return new
            {
                s.Id,
                s.Name,
                LinkedPc = s.Pc?.Number,
                Zone     = s.Pc?.Zone,
                IsOnline = online,
                LastGsiAt = ls?.LastGsiAt,
                Match = ls?.Match is null ? null : MapMatchBrief(ls.Match),
            };
        });

        return Ok(result);
    }

    [HttpGet("{serverId:int}")]
    public async Task<IActionResult> ServerDetail(int serverId)
    {
        var server = await db.GameServers
            .Include(s => s.Pc)
            .FirstOrDefaultAsync(s => s.Id == serverId && s.IsActive);

        if (server is null) return NotFound();

        var live = store.GetAllLive().FirstOrDefault(x => x.ServerId == serverId);

        return Ok(new
        {
            server.Id,
            server.Name,
            LinkedPc = server.Pc?.Number,
            Zone     = server.Pc?.Zone,
            IsOnline = live?.IsOnline == true &&
                       live.LastGsiAt.HasValue &&
                       (DateTime.UtcNow - live.LastGsiAt.Value).TotalSeconds < 45,
            LastGsiAt = live?.LastGsiAt,
            Match = live?.Match is null ? null : MapMatchFull(live.Match),
        });
    }

    [HttpGet("matches")]
    public async Task<IActionResult> RecentMatches([FromQuery] int limit = 20)
    {
        var list = await db.Matches
            .Include(m => m.Server)
            .Where(m => m.Status == "completed")
            .OrderByDescending(m => m.EndedAt ?? m.StartedAt)
            .Take(Math.Clamp(limit, 1, 100))
            .Select(m => new
            {
                m.Id,
                m.MapName,
                m.Mode,
                m.ScoreCt,
                m.ScoreT,
                m.TeamCtName,
                m.TeamTName,
                m.TotalRounds,
                m.StartedAt,
                m.EndedAt,
                Server = m.Server.Name,
                Winner = m.ScoreCt > m.ScoreT ? m.TeamCtName : m.ScoreT > m.ScoreCt ? m.TeamTName : "Draw",
            })
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("matches/{id:int}")]
    public async Task<IActionResult> MatchDetail(int id)
    {
        var match = await db.Matches
            .Include(m => m.Server)
            .Include(m => m.PlayerStats)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (match is null) return NotFound();

        return Ok(new
        {
            match.Id,
            match.MapName,
            match.Mode,
            match.ScoreCt,
            match.ScoreT,
            match.TeamCtName,
            match.TeamTName,
            match.TotalRounds,
            match.Status,
            match.StartedAt,
            match.EndedAt,
            Server = match.Server.Name,
            Players = match.PlayerStats
                .OrderByDescending(p => p.Score)
                .Select(p =>
                {
                    var r = HltvRating.EffectiveRounds(p.Kills, p.Deaths, match.TotalRounds);
                    return new
                    {
                        p.PlayerName,
                        p.Team,
                        p.Kills,
                        p.Deaths,
                        p.Assists,
                        p.Mvps,
                        p.Score,
                        p.Headshots,
                        Kd    = p.Deaths > 0 ? Math.Round((double)p.Kills / p.Deaths, 2) : (double)p.Kills,
                        HsPct = p.Kills > 0 ? Math.Round((double)p.Headshots / p.Kills * 100, 1) : 0.0,
                        Rating2 = HltvRating.Calculate2(p.Kills, p.Deaths, p.Assists, r, p.Mvps, p.Score),
                        Rating3 = HltvRating.Calculate3(p.Kills, p.Deaths, p.Assists, r, p.Mvps, p.Score),
                    };
                }),
        });
    }

    private static object MapMatchBrief(LiveMatchState m) => new
    {
        m.MatchId,
        m.MapName,
        m.Mode,
        m.Round,
        m.RoundPhase,
        m.ScoreCt,
        m.ScoreT,
        m.TeamCtName,
        m.TeamTName,
        m.BombState,
        m.UpdatedAt,
        PlayerCount = m.Players.Count,
        AliveCt = m.Players.Count(p => p.Alive && GsiStore.IsCtTeam(p.Team)),
        AliveT  = m.Players.Count(p => p.Alive && GsiStore.IsTTeam(p.Team)),
    };

    private static object MapMatchFull(LiveMatchState m)
    {
        var rounds = Math.Max(m.Round, 1);

        return new
        {
            m.MatchId,
            m.MapName,
            m.Mode,
            m.MapPhase,
            m.Round,
            m.RoundPhase,
            m.ScoreCt,
            m.ScoreT,
            m.TeamCtName,
            m.TeamTName,
            m.BombState,
            m.StartedAt,
            m.UpdatedAt,
            AliveCt = m.Players.Count(p => p.Alive && GsiStore.IsCtTeam(p.Team)),
            AliveT  = m.Players.Count(p => p.Alive && GsiStore.IsTTeam(p.Team)),
            Players = m.Players.Select(p =>
            {
                var r = HltvRating.EffectiveRounds(p.Kills, p.Deaths, m.Round);
                double? adr = p.Damage > 0 ? (double)p.Damage / r : null;
                return new
                {
                    p.SteamId,
                    p.Name,
                    p.Team,
                    p.Kills,
                    p.Deaths,
                    p.Assists,
                    p.Mvps,
                    p.Score,
                    p.Headshots,
                    p.Health,
                    p.Armor,
                    p.Money,
                    p.HasHelmet,
                    p.Damage,
                    p.Alive,
                    p.Weapon,
                    p.Kd,
                    p.HsPct,
                    Rating2 = HltvRating.Calculate2(p.Kills, p.Deaths, p.Assists, r, p.Mvps, p.Score, adr),
                    Rating3 = HltvRating.Calculate3(p.Kills, p.Deaths, p.Assists, r, p.Mvps, p.Score, adr),
                };
            }),
        };
    }
}
