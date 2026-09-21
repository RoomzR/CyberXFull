using CyberX.Data.Persistence;
using CyberX.Data.Persistence.Entities;
using CyberX.WebApi.Services.Veto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CyberX.WebApi.Controllers;

[ApiController]
[Route("api/live/veto")]
public sealed class VetoLiveController(CyberXDbContext db) : ControllerBase
{
    [HttpGet("active")]
    public async Task<IActionResult> Active([FromQuery] int? serverId)
    {
        var q = db.MatchSeries
            .Include(s => s.VetoActions.OrderBy(a => a.StepOrder))
            .Where(s => s.Status != "finished");

        if (serverId.HasValue)
            q = q.Where(s => s.ServerId == serverId);

        var series = await q.OrderByDescending(s => s.CreatedAt).FirstOrDefaultAsync();
        if (series is null) return Ok(null);

        return Ok(MapSeries(series));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var series = await db.MatchSeries
            .Include(s => s.VetoActions.OrderBy(a => a.StepOrder))
            .FirstOrDefaultAsync(s => s.Id == id);

        if (series is null) return NotFound();
        return Ok(MapSeries(series));
    }

    internal static object MapSeries(MatchSeriesRecord s)
    {
        var steps = VetoFormats.GetSteps(s.Format);
        var actions = s.VetoActions.OrderBy(a => a.StepOrder).ToList();
        var playableRoles = VetoFormats.PlayableRoles(s.Format);
        var playOrder = 0;
        var playableMaps = new List<object>();

        for (var i = 0; i < actions.Count; i++)
        {
            var stepDef = i < steps.Count ? steps[i] : null;
            if (stepDef?.MapRole is null || !playableRoles.Contains(stepDef.MapRole))
                continue;
            playOrder++;
            playableMaps.Add(new
            {
                Order = playOrder,
                MapName = actions[i].MapName,
                Role = stepDef.MapRole,
                Label = $"MAP {playOrder}",
            });
        }

        // BO1: единственная оставшаяся карта после 6 банов
        if (VetoFormats.IsBanOnlyFormat(s.Format))
        {
            var remaining = VetoFormats.GetBo1RemainingMap(actions.Select(a => a.MapName));
            if (remaining is not null && actions.Count >= steps.Count)
            {
                playableMaps.Clear();
                playableMaps.Add(new { Order = 1, MapName = remaining, Role = "map1", Label = "MAP 1" });
            }
        }

        return new
        {
            s.Id,
            s.ServerId,
            s.Team1Name,
            s.Team2Name,
            s.Format,
            s.Status,
            s.CreatedAt,
            TotalSteps = steps.Count,
            MapsPlayed = VetoFormats.MapsPlayed(s.Format),
            PlayableMaps = playableMaps,
            Actions = actions.Select(a => new
            {
                a.Id,
                a.StepOrder,
                a.Action,
                a.MapName,
                a.Team,
                a.SideNote,
                a.CreatedAt,
            }),
            MapPool = GetMapPoolWithStatus(s),
            Log = actions.Select((a, i) => new
            {
                Step = i + 1,
                Label = a.Action.ToUpperInvariant(),
                Team = a.Team == "team1" ? s.Team1Name : s.Team2Name,
                Map = a.MapName,
                Note = a.SideNote,
            }),
        };
    }

    private static readonly string[] ActiveDuty = VetoFormats.ActiveDutyMaps;

    private static IEnumerable<object> GetMapPoolWithStatus(MatchSeriesRecord s)
    {
        var acted = s.VetoActions.ToDictionary(a => a.MapName, a => a);
        var actions = s.VetoActions.ToList();
        var bo1Done = VetoFormats.IsBanOnlyFormat(s.Format)
                      && actions.Count >= VetoFormats.GetTotalSteps(s.Format);
        var bo1Remaining = bo1Done
            ? VetoFormats.GetBo1RemainingMap(actions.Select(a => a.MapName))
            : null;

        foreach (var map in ActiveDuty)
        {
            acted.TryGetValue(map, out var action);
            var status = action?.Action ?? "available";

            if (bo1Remaining == map)
                status = "decider";

            yield return new
            {
                MapName = map,
                Status = status,
                Team = action?.Team,
                SideNote = action?.SideNote,
            };
        }
    }
}

[ApiController]
[Route("api/admin/veto")]
[Authorize(Roles = "Admin")]
public sealed class AdminVetoController(CyberXDbContext db) : ControllerBase
{
    public record CreateSeriesDto(string Team1Name, string Team2Name, int? ServerId, string? Format);
    public record VetoActionDto(string Action, string MapName, string Team, string? SideNote);

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var list = await db.MatchSeries
            .Include(s => s.VetoActions)
            .OrderByDescending(s => s.CreatedAt)
            .Take(20)
            .ToListAsync();

        return Ok(list.Select(VetoLiveController.MapSeries));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateSeriesDto dto)
    {
        var s = new MatchSeriesRecord
        {
            Team1Name = dto.Team1Name,
            Team2Name = dto.Team2Name,
            ServerId  = dto.ServerId,
            Format    = dto.Format ?? "bo1",
            Status    = "veto",
        };
        db.MatchSeries.Add(s);
        await db.SaveChangesAsync();
        return Ok(VetoLiveController.MapSeries(s));
    }

    [HttpPost("{id:int}/actions")]
    public async Task<IActionResult> AddAction(int id, VetoActionDto dto)
    {
        var series = await db.MatchSeries
            .Include(s => s.VetoActions)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (series is null) return NotFound();

        var order = series.VetoActions.Count;
        var expected = VetoFormats.GetStepAt(series.Format, order);

        if (expected is null)
            return BadRequest(new { error = "Veto already complete" });

        db.MatchVetoActions.Add(new MatchVetoActionRecord
        {
            SeriesId  = id,
            StepOrder = order + 1,
            Action    = dto.Action.ToLowerInvariant(),
            MapName   = dto.MapName,
            Team      = dto.Team,
            SideNote  = dto.SideNote,
        });

        var totalSteps = VetoFormats.GetTotalSteps(series.Format);
        if (order + 1 >= totalSteps)
            series.Status = "live";

        await db.SaveChangesAsync();

        await db.Entry(series).Collection(s => s.VetoActions).LoadAsync();
        return Ok(VetoLiveController.MapSeries(series));
    }

    [HttpPatch("{id:int}/finish")]
    public async Task<IActionResult> Finish(int id)
    {
        var s = await db.MatchSeries.FindAsync(id);
        if (s is null) return NotFound();
        s.Status = "finished";
        await db.SaveChangesAsync();
        return Ok(new { s.Id, s.Status });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var s = await db.MatchSeries
            .Include(x => x.VetoActions)
            .FirstOrDefaultAsync(x => x.Id == id);
        if (s is null) return NotFound();
        db.MatchSeries.Remove(s);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}/actions")]
    public async Task<IActionResult> ResetActions(int id)
    {
        var s = await db.MatchSeries
            .Include(x => x.VetoActions)
            .FirstOrDefaultAsync(x => x.Id == id);
        if (s is null) return NotFound();

        db.MatchVetoActions.RemoveRange(s.VetoActions);
        s.Status = "veto";
        await db.SaveChangesAsync();

        return Ok(VetoLiveController.MapSeries(s));
    }
}
