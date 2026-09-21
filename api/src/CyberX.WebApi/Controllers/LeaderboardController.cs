using CyberX.Data.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CyberX.WebApi.Controllers;

[ApiController]
[Route("api/leaderboard")]
public sealed class LeaderboardController(CyberXDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Top()
    {
        var top = await db.Bookings
            .Where(b => b.Status == "completed" || b.Status == "active")
            .GroupBy(b => new { b.UserId, b.User.Username })
            .Select(g => new
            {
                g.Key.Username,
                Hours    = g.Sum(b => b.DurationH),
                Spent    = g.Sum(b => b.TotalPrice),
                Sessions = g.Count(),
            })
            .OrderByDescending(x => x.Hours)
            .ThenByDescending(x => x.Spent)
            .Take(10)
            .ToListAsync();
        return Ok(top);
    }
}
