using CyberX.Data.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CyberX.WebApi.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public sealed class AdminController(CyberXDbContext db) : ControllerBase
{
    // ── Dashboard stats ───────────────────────────────────────────────────
    [HttpGet("stats")]
    public async Task<IActionResult> Stats()
    {
        var today = DateTime.UtcNow.Date;
        var stats = new
        {
            TotalUsers    = await db.Users.CountAsync(),
            ActiveUsers   = await db.Users.CountAsync(u => u.IsActive),
            TotalPcs      = await db.Pcs.CountAsync(p => p.IsActive),
            FreePcs       = await db.Pcs.CountAsync(p => p.Status == "free" && p.IsActive),
            OccupiedPcs   = await db.Pcs.CountAsync(p => p.Status == "occupied" && p.IsActive),
            TodayBookings = await db.Bookings.CountAsync(b => b.CreatedAt.Date == today),
            TodayRevenue  = await db.Bookings
                .Where(b => b.CreatedAt.Date == today && b.Status != "cancelled")
                .SumAsync(b => (decimal?)b.TotalPrice) ?? 0m,
            MonthRevenue  = await db.Bookings
                .Where(b => b.CreatedAt.Month == DateTime.UtcNow.Month && b.Status != "cancelled")
                .SumAsync(b => (decimal?)b.TotalPrice) ?? 0m,
            PcStatusMap   = await db.Pcs.Where(p => p.IsActive)
                .GroupBy(p => p.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync(),
            ZoneStats     = await db.Pcs.Where(p => p.IsActive)
                .GroupBy(p => p.Zone)
                .Select(g => new { Zone = g.Key, Total = g.Count(), Occupied = g.Count(p => p.Status == "occupied") })
                .ToListAsync(),
            RecentBookings = await db.Bookings
                .Include(b => b.User).Include(b => b.Pc)
                .OrderByDescending(b => b.CreatedAt)
                .Take(10)
                .Select(b => new { b.Id, b.StartTime, b.DurationH, b.TotalPrice, b.Status,
                    User = b.User.Username, Pc = b.Pc.Number, Zone = b.Pc.Zone })
                .ToListAsync(),
        };
        return Ok(stats);
    }

    // ── User management ───────────────────────────────────────────────────
    [HttpGet("users")]
    public async Task<IActionResult> Users([FromQuery] string? search)
    {
        var q = db.Users.AsQueryable();
        if (!string.IsNullOrEmpty(search))
            q = q.Where(u => u.Username.Contains(search) || u.Email.Contains(search));

        var list = await q.OrderByDescending(u => u.CreatedAt)
            .Select(u => new { u.Id, u.Username, u.Email, u.Role, u.Balance, u.IsActive, u.CreatedAt, u.LastLoginAt })
            .ToListAsync();
        return Ok(list);
    }

    [HttpPatch("users/{id}/role")]
    public async Task<IActionResult> SetRole(int id, [FromBody] SetRoleDto dto)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();
        user.Role = dto.Role;
        await db.SaveChangesAsync();
        return Ok(new { user.Id, user.Role });
    }

    [HttpPatch("users/{id}/toggle")]
    public async Task<IActionResult> Toggle(int id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();
        user.IsActive = !user.IsActive;
        await db.SaveChangesAsync();
        return Ok(new { user.Id, user.IsActive });
    }

    [HttpPatch("users/{id}/balance")]
    public async Task<IActionResult> AddBalance(int id, [FromBody] BalanceDto dto)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null) return NotFound();
        user.Balance += dto.Amount;
        await db.SaveChangesAsync();
        return Ok(new { user.Id, user.Balance });
    }

    // ── Revenue chart last 30 days ─────────────────────────────────────────
    [HttpGet("revenue-chart")]
    public async Task<IActionResult> RevenueChart()
    {
        var from = DateTime.UtcNow.Date.AddDays(-29);
        var data = await db.Bookings
            .Where(b => b.CreatedAt >= from && b.Status != "cancelled")
            .GroupBy(b => b.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Revenue = g.Sum(b => b.TotalPrice) })
            .OrderBy(x => x.Date)
            .ToListAsync();
        return Ok(data);
    }

    public record SetRoleDto(string Role);
    public record BalanceDto(decimal Amount);
}
