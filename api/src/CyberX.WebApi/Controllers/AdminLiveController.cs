using CyberX.Data.Persistence;
using CyberX.WebApi.Services.Gsi;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CyberX.WebApi.Controllers;

[ApiController]
[Route("api/admin/live")]
[Authorize(Roles = "Admin")]
public sealed class AdminLiveController(CyberXDbContext db, GsiStore gsi) : ControllerBase
{
    [HttpGet("overview")]
    public async Task<IActionResult> Overview()
    {
        var servers = await db.GameServers
            .Include(s => s.Pc)
            .Where(s => s.IsActive)
            .OrderBy(s => s.Name)
            .ToListAsync();

        var live = gsi.GetAllLive().ToDictionary(x => x.ServerId);
        var now = DateTime.UtcNow;

        var dbLiveMatches = await db.Matches
            .Where(m => m.Status == "live")
            .OrderByDescending(m => m.StartedAt)
            .Select(m => new { m.ServerId, m.Id, m.MapName, m.ScoreCt, m.ScoreT })
            .ToListAsync();

        var dbLiveByServer = dbLiveMatches
            .GroupBy(m => m.ServerId)
            .ToDictionary(g => g.Key, g => g.First());

        var serverRows = servers.Select(s =>
        {
            live.TryGetValue(s.Id, out var ls);
            dbLiveByServer.TryGetValue(s.Id, out var dbLive);

            var online = ls?.IsOnline == true &&
                         ls.LastGsiAt.HasValue &&
                         (now - ls.LastGsiAt.Value).TotalSeconds < 45;

            var liveMatchId = ls?.Match?.MatchId ?? dbLive?.Id;
            var hasGsiMatch = ls?.Match is not null;
            var hasDbLive   = dbLive is not null;

            return new
            {
                s.Id,
                s.Name,
                LinkedPc = s.Pc?.Number,
                IsOnline = online,
                HasMatch = hasGsiMatch || hasDbLive,
                LiveMatchId = liveMatchId,
                LastGsiAt = ls?.LastGsiAt,
                Map = ls?.Match?.MapName ?? dbLive?.MapName,
                Score = ls?.Match is not null
                    ? $"{ls.Match.ScoreCt}:{ls.Match.ScoreT}"
                    : dbLive is not null ? $"{dbLive.ScoreCt}:{dbLive.ScoreT}" : null,
                GsiBlocked = gsi.IsBlocked(s.Id),
            };
        });

        var totalMatches = await db.Matches.CountAsync(m => m.Status == "completed");
        var liveMatches  = await db.Matches.CountAsync(m => m.Status == "live");
        var activeVeto   = await db.MatchSeries
            .Where(s => s.Status != "finished")
            .CountAsync();

        var recentMatches = await db.Matches
            .Include(m => m.Server)
            .OrderByDescending(m => m.EndedAt ?? m.StartedAt)
            .Take(10)
            .Select(m => new
            {
                m.Id,
                m.MapName,
                m.ScoreCt,
                m.ScoreT,
                m.TotalRounds,
                m.Status,
                m.StartedAt,
                m.EndedAt,
                Server = m.Server.Name,
                ServerId = m.ServerId,
            })
            .ToListAsync();

        return Ok(new
        {
            ServersTotal   = servers.Count,
            ServersOnline  = serverRows.Count(s => s.IsOnline),
            ServersLive    = serverRows.Count(s => s.HasMatch),
            MatchesTotal   = totalMatches,
            MatchesLive    = liveMatches,
            ActiveVeto     = activeVeto,
            Servers        = serverRows,
            RecentMatches  = recentMatches,
        });
    }

    [HttpGet("matches")]
    public async Task<IActionResult> AllMatches([FromQuery] int limit = 50)
    {
        var list = await db.Matches
            .Include(m => m.Server)
            .Include(m => m.PlayerStats)
            .OrderByDescending(m => m.EndedAt ?? m.StartedAt)
            .Take(Math.Clamp(limit, 1, 200))
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
                m.Status,
                m.StartedAt,
                m.EndedAt,
                Server = m.Server.Name,
                ServerId = m.ServerId,
                PlayerCount = m.PlayerStats.Count,
            })
            .ToListAsync();

        return Ok(list);
    }

    [HttpDelete("matches/{id:int}")]
    public async Task<IActionResult> DeleteMatch(int id)
    {
        try
        {
            var m = await db.Matches
                .Include(x => x.PlayerStats)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (m is null) return NotFound();

            gsi.ClearLiveMatch(id);
            if (m.Status == "live")
                gsi.ClearServerFully(m.ServerId, 5);
            else
                gsi.ClearLiveForServer(m.ServerId);

            if (m.PlayerStats.Count > 0)
                db.MatchPlayerStats.RemoveRange(m.PlayerStats);

            db.Matches.Remove(m);
            await db.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            return Problem(detail: ex.Message, statusCode: 500, title: "Не удалось удалить матч");
        }
    }

    /// <summary>Force-complete a live match (freeze score, stop GSI tracking).</summary>
    [HttpPatch("matches/{id:int}/finish")]
    public async Task<IActionResult> FinishMatch(int id)
    {
        var m = await db.Matches.FindAsync(id);
        if (m is null) return NotFound();

        if (m.Status != "completed")
        {
            m.Status  = "completed";
            m.EndedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
        }

        gsi.ClearLiveMatch(id);
        gsi.ClearServerFully(m.ServerId, 5);

        return Ok(new { m.Id, m.Status, m.EndedAt, m.ScoreCt, m.ScoreT });
    }

    /// <summary>Reset in-memory live state for a server (clears stuck live on /live).</summary>
    [HttpPost("servers/{serverId:int}/reset-live")]
    public async Task<IActionResult> ResetServerLive(int serverId, [FromQuery] int blockMinutes = 5)
    {
        var server = await db.GameServers.FindAsync(serverId);
        if (server is null) return NotFound();

        var gsiCleared = gsi.ClearServerFully(serverId, blockMinutes);

        var liveMatches = await db.Matches
            .Where(m => m.ServerId == serverId && m.Status == "live")
            .ToListAsync();

        foreach (var m in liveMatches)
        {
            m.Status  = "completed";
            m.EndedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();
        return Ok(new { serverId, finalized = liveMatches.Count, gsiCleared, blockedMinutes = blockMinutes });
    }

    /// <summary>Delete all live matches on a server + force-clear GSI memory.</summary>
    [HttpDelete("servers/{serverId:int}/live-matches")]
    public async Task<IActionResult> DeleteServerLiveMatches(int serverId, [FromQuery] int blockMinutes = 5)
    {
        try
        {
            var server = await db.GameServers.FindAsync(serverId);
            if (server is null) return NotFound();

            var gsiCleared = gsi.ClearServerFully(serverId, blockMinutes);

            var liveMatches = await db.Matches
                .Include(m => m.PlayerStats)
                .Where(m => m.ServerId == serverId && m.Status == "live")
                .ToListAsync();

            foreach (var m in liveMatches)
            {
                gsi.ClearLiveMatch(m.Id);
                if (m.PlayerStats.Count > 0)
                    db.MatchPlayerStats.RemoveRange(m.PlayerStats);
                db.Matches.Remove(m);
            }

            await db.SaveChangesAsync();
            return Ok(new { serverId, deleted = liveMatches.Count, gsiCleared, blockedMinutes = blockMinutes });
        }
        catch (Exception ex)
        {
            return Problem(detail: ex.Message, statusCode: 500, title: "Не удалось удалить live-матчи");
        }
    }

    /// <summary>Resume GSI tracking after admin clear.</summary>
    [HttpPost("servers/{serverId:int}/resume-gsi")]
    public async Task<IActionResult> ResumeGsi(int serverId)
    {
        if (await db.GameServers.FindAsync(serverId) is null) return NotFound();
        gsi.UnblockServer(serverId);
        gsi.ClearLiveForServer(serverId);
        return Ok(new { serverId, resumed = true });
    }

    /// <summary>Delete ALL matches on server (live + completed) permanently.</summary>
    [HttpDelete("servers/{serverId:int}/all-matches")]
    public async Task<IActionResult> PurgeAllServerMatches(int serverId, [FromQuery] int blockMinutes = 5)
    {
        try
        {
            var server = await db.GameServers.FindAsync(serverId);
            if (server is null) return NotFound();

            var gsiCleared = gsi.ClearServerFully(serverId, blockMinutes);

            var matches = await db.Matches
                .Include(m => m.PlayerStats)
                .Where(m => m.ServerId == serverId)
                .ToListAsync();

            foreach (var m in matches)
            {
                gsi.ClearLiveMatch(m.Id);
                if (m.PlayerStats.Count > 0)
                    db.MatchPlayerStats.RemoveRange(m.PlayerStats);
                db.Matches.Remove(m);
            }

            await db.SaveChangesAsync();
            return Ok(new { serverId, deleted = matches.Count, gsiCleared, blockedMinutes = blockMinutes });
        }
        catch (Exception ex)
        {
            return Problem(detail: ex.Message, statusCode: 500, title: "Не удалось удалить матчи");
        }
    }
}
