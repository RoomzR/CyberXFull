using CyberX.Data.Persistence;
using CyberX.Data.Persistence.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CyberX.WebApi.Controllers;

[ApiController]
[Route("api/pcs")]
public sealed class PcController(CyberXDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await db.Pcs.Where(p => p.IsActive).OrderBy(p => p.Number)
            .Select(p => new { p.Id, p.Number, p.Zone, p.Specs, p.HourlyRate, p.Status })
            .ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var pc = await db.Pcs.FindAsync(id);
        return pc is null ? NotFound() : Ok(pc);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var pc = await db.Pcs.FindAsync(id);
        if (pc is null) return NotFound();
        pc.Status = dto.Status;
        await db.SaveChangesAsync();
        return Ok(new { pc.Id, pc.Number, pc.Status });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreatePcDto dto)
    {
        var pc = new PcRecord
        {
            Number     = dto.Number,
            Zone       = dto.Zone,
            Specs      = dto.Specs,
            HourlyRate = dto.HourlyRate,
        };
        db.Pcs.Add(pc);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = pc.Id }, pc);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] CreatePcDto dto)
    {
        var pc = await db.Pcs.FindAsync(id);
        if (pc is null) return NotFound();
        pc.Number     = dto.Number;
        pc.Zone       = dto.Zone;
        pc.Specs      = dto.Specs;
        pc.HourlyRate = dto.HourlyRate;
        await db.SaveChangesAsync();
        return Ok(pc);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var pc = await db.Pcs.FindAsync(id);
        if (pc is null) return NotFound();
        pc.IsActive = false;
        await db.SaveChangesAsync();
        return NoContent();
    }

    public record UpdateStatusDto(string Status);
    public record CreatePcDto(int Number, string Zone, string Specs, decimal HourlyRate);
}
