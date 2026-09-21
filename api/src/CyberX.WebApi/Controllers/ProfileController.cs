using System.Security.Claims;
using CyberX.Data.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CyberX.WebApi.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public sealed class ProfileController(CyberXDbContext db) : ControllerBase
{
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? User.FindFirstValue("sub")!);

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var uid = CurrentUserId;
        var user = await db.Users
            .Where(u => u.Id == uid)
            .Select(u => new { u.Id, u.Username, u.Email, u.Role, u.Balance, u.CreatedAt, u.LastLoginAt })
            .FirstOrDefaultAsync();
        return user is null ? NotFound() : Ok(user);
    }

    [HttpGet("bookings")]
    public async Task<IActionResult> Bookings()
    {
        var uid = CurrentUserId;
        var list = await db.Bookings
            .Where(b => b.UserId == uid)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new
            {
                b.Id, b.StartTime, b.DurationH, b.TotalPrice, b.Status, b.Notes, b.CreatedAt,
                Pc = new { b.Pc.Number, b.Pc.Zone, b.Pc.Specs, b.Pc.HourlyRate }
            })
            .ToListAsync();
        return Ok(list);
    }

    [HttpGet("active-session")]
    public async Task<IActionResult> ActiveSession()
    {
        var uid = CurrentUserId;
        var active = await db.Bookings
            .Where(b => b.UserId == uid && b.Status == "active")
            .Select(b => new
            {
                b.Id, b.StartTime, b.DurationH, b.TotalPrice,
                EndTime = b.StartTime.AddHours(b.DurationH),
                Pc = new { b.Pc.Number, b.Pc.Zone, b.Pc.Specs }
            })
            .FirstOrDefaultAsync();
        return Ok(active);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> Stats()
    {
        var uid = CurrentUserId;
        var q = db.Bookings.Where(b => b.UserId == uid && b.Status != "cancelled");
        var stats = new
        {
            TotalBookings = await q.CountAsync(),
            TotalHours    = await q.SumAsync(b => (int?)b.DurationH) ?? 0,
            TotalSpent    = await q.SumAsync(b => (decimal?)b.TotalPrice) ?? 0m,
            FavoriteZone  = await q.GroupBy(b => b.Pc.Zone)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key)
                .FirstOrDefaultAsync(),
        };
        return Ok(stats);
    }

    [HttpPatch("username")]
    public async Task<IActionResult> UpdateUsername([FromBody] UpdateUsernameDto dto)
    {
        var user = await db.Users.FindAsync(CurrentUserId);
        if (user is null) return NotFound();
        if (await db.Users.AnyAsync(u => u.Username == dto.Username && u.Id != user.Id))
            return Conflict("Username already taken");
        user.Username = dto.Username;
        await db.SaveChangesAsync();
        return Ok(new { user.Username });
    }

    public record UpdateUsernameDto(string Username);
}
