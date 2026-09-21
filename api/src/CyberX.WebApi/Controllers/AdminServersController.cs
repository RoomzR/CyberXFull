using System.Security.Cryptography;
using CyberX.Data.Persistence;
using CyberX.Data.Persistence.Entities;
using CyberX.WebApi.Services.Gsi;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CyberX.WebApi.Controllers;

[ApiController]
[Route("api/admin/servers")]
[Authorize(Roles = "Admin")]
public sealed class AdminServersController(CyberXDbContext db, IConfiguration config) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var list = await db.GameServers
            .Include(s => s.Pc)
            .OrderBy(s => s.Name)
            .Select(s => new
            {
                s.Id, s.Name, s.GsiToken, s.IpAddress, s.Port,
                s.LinkedPcId, LinkedPc = s.Pc != null ? s.Pc.Number : (int?)null,
                s.IsActive, s.CreatedAt,
                GsiUrl = BuildGsiUrl(s.GsiToken),
            })
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateServerDto dto)
    {
        var token = GenerateToken();
        var server = new GameServerRecord
        {
            Name       = dto.Name,
            GsiToken   = token,
            IpAddress  = dto.IpAddress,
            Port       = dto.Port,
            LinkedPcId = dto.LinkedPcId,
            IsActive   = true,
            CreatedAt  = DateTime.UtcNow,
        };
        db.GameServers.Add(server);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(List), new { id = server.Id }, new
        {
            server.Id, server.Name, server.GsiToken, server.IpAddress, server.Port,
            server.LinkedPcId, server.IsActive, GsiUrl = BuildGsiUrl(server.GsiToken),
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateServerDto dto)
    {
        var s = await db.GameServers.FindAsync(id);
        if (s is null) return NotFound();
        s.Name       = dto.Name;
        s.IpAddress  = dto.IpAddress;
        s.Port       = dto.Port;
        s.LinkedPcId = dto.LinkedPcId;
        await db.SaveChangesAsync();
        return Ok(new { s.Id, s.Name, GsiUrl = BuildGsiUrl(s.GsiToken) });
    }

    [HttpPatch("{id:int}/toggle")]
    public async Task<IActionResult> Toggle(int id)
    {
        var s = await db.GameServers.FindAsync(id);
        if (s is null) return NotFound();
        s.IsActive = !s.IsActive;
        await db.SaveChangesAsync();
        return Ok(new { s.Id, s.IsActive });
    }

    [HttpPost("{id:int}/regenerate-token")]
    public async Task<IActionResult> RegenerateToken(int id)
    {
        var s = await db.GameServers.FindAsync(id);
        if (s is null) return NotFound();
        s.GsiToken = GenerateToken();
        await db.SaveChangesAsync();
        return Ok(new { s.Id, s.GsiToken, GsiUrl = BuildGsiUrl(s.GsiToken) });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var s = await db.GameServers.FindAsync(id);
        if (s is null) return NotFound();
        s.IsActive = false;
        await db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>CS2 gamestate_integration cfg file content.</summary>
    [HttpGet("{id:int}/gsi-config")]
    public async Task<IActionResult> GsiConfig(int id, [FromQuery] string? host)
    {
        var s = await db.GameServers.FindAsync(id);
        if (s is null) return NotFound();

        var baseUrl = host ?? Request.Host.Value;
        var scheme  = Request.Scheme;
        if (!baseUrl.Contains(':') && scheme == "http")
            baseUrl = $"{Request.Host.Host}:5006";

        var uri = $"{scheme}://{baseUrl}/api/gsi/{s.GsiToken}";
        var cfg = GsiCfgBuilder.Build(uri, s.GsiToken);

        return Ok(new
        {
            uri,
            token = s.GsiToken,
            cfg,
            installPath = GsiCfgBuilder.DedicatedInstallPath,
            clientInstallPath = GsiCfgBuilder.ClientInstallPath,
            dedicatedInstallPath = GsiCfgBuilder.DedicatedInstallPath,
            playerHints = GsiCfgBuilder.PlayerHintLines,
        });
    }

    /// <summary>Permanently remove server, all matches, and veto series.</summary>
    [HttpDelete("{id:int}/hard")]
    public async Task<IActionResult> HardDelete(int id, [FromServices] GsiStore gsi)
    {
        var s = await db.GameServers
            .Include(x => x.Matches)
            .FirstOrDefaultAsync(x => x.Id == id);
        if (s is null) return NotFound();

        gsi.ClearServerFully(id, 0);

        var matchIds = s.Matches.Select(m => m.Id).ToList();
        if (matchIds.Count > 0)
        {
            var stats = await db.MatchPlayerStats.Where(ps => matchIds.Contains(ps.MatchId)).ToListAsync();
            db.MatchPlayerStats.RemoveRange(stats);
            db.Matches.RemoveRange(s.Matches);
        }

        var series = await db.MatchSeries.Where(x => x.ServerId == id).ToListAsync();
        if (series.Count > 0)
            db.MatchSeries.RemoveRange(series);

        db.GameServers.Remove(s);
        await db.SaveChangesAsync();
        return Ok(new { id, deletedMatches = matchIds.Count, deletedVetoSeries = series.Count });
    }

    private string BuildGsiUrl(string token)
    {
        var host = config["Gsi:PublicHost"];
        if (!string.IsNullOrEmpty(host))
            return $"{host.TrimEnd('/')}/api/gsi/{token}";
        return $"{Request.Scheme}://{Request.Host}/api/gsi/{token}";
    }

    private static string GenerateToken() =>
        Convert.ToHexString(RandomNumberGenerator.GetBytes(16)).ToLowerInvariant();

    public record CreateServerDto(string Name, string? IpAddress, int? Port, int? LinkedPcId);
    public record UpdateServerDto(string Name, string? IpAddress, int? Port, int? LinkedPcId);
}
