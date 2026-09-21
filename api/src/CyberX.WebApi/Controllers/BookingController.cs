using System.Security.Claims;
using CyberX.Data.Persistence;
using CyberX.Data.Persistence.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CyberX.WebApi.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize]
public sealed class BookingController(CyberXDbContext db) : ControllerBase
{
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
               ?? User.FindFirstValue("sub")!);

    // ── Player: my bookings ────────────────────────────────────────────────
    [HttpGet("my")]
    public async Task<IActionResult> GetMine()
    {
        var uid = CurrentUserId;
        var list = await db.Bookings
            .Where(b => b.UserId == uid)
            .OrderByDescending(b => b.StartTime)
            .Select(b => new
            {
                b.Id, b.PcId, b.StartTime, b.DurationH, b.TotalPrice, b.Status, b.Notes,
                Pc = new { b.Pc.Number, b.Pc.Zone, b.Pc.Specs }
            })
            .ToListAsync();
        return Ok(list);
    }

    // ── Player: create booking ────────────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingDto dto)
    {
        var pc = await db.Pcs.FindAsync(dto.PcId);
        if (pc is null) return NotFound("PC not found");

        // Check conflicts
        var end = dto.StartTime.AddHours(dto.DurationH);
        var conflict = await db.Bookings.AnyAsync(b =>
            b.PcId == dto.PcId &&
            b.Status != "cancelled" &&
            b.StartTime < end &&
            b.StartTime.AddHours(b.DurationH) > dto.StartTime);

        if (conflict) return Conflict("PC is already booked for this time slot");

        var user = await db.Users.FindAsync(CurrentUserId);
        if (user is null) return Unauthorized();

        var totalPrice = pc.HourlyRate * dto.DurationH;

        if (user.Balance < totalPrice)
            return BadRequest("Insufficient balance");

        user.Balance -= totalPrice;

        var booking = new BookingRecord
        {
            UserId     = CurrentUserId,
            PcId       = dto.PcId,
            StartTime  = dto.StartTime.ToUniversalTime(),
            DurationH  = dto.DurationH,
            TotalPrice = totalPrice,
            Status     = "pending",
            Notes      = dto.Notes,
            CreatedAt  = DateTime.UtcNow,
        };
        db.Bookings.Add(booking);

        // Auto activate if starts within 15 min
        if (dto.StartTime <= DateTime.UtcNow.AddMinutes(15))
        {
            booking.Status = "active";
            pc.Status = "occupied";
        }
        else
        {
            pc.Status = "booked";
        }

        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetMine), new { }, new { booking.Id, booking.Status, booking.TotalPrice });
    }

    // ── Player: cancel booking ────────────────────────────────────────────
    [HttpDelete("{id}")]
    public async Task<IActionResult> Cancel(int id)
    {
        var uid = CurrentUserId;
        var booking = await db.Bookings.Include(b => b.Pc).FirstOrDefaultAsync(b => b.Id == id);
        if (booking is null) return NotFound();

        var role = User.FindFirstValue(ClaimTypes.Role);
        if (booking.UserId != uid && role is not ("Admin" or "Manager"))
            return Forbid();

        if (booking.Status is "completed")
            return BadRequest("Cannot cancel completed booking");

        booking.Status = "cancelled";

        // Refund
        if (booking.Status != "active")
        {
            var user = await db.Users.FindAsync(booking.UserId);
            if (user != null) user.Balance += booking.TotalPrice;
        }

        // Free PC if no other active booking
        var hasOtherActive = await db.Bookings.AnyAsync(b =>
            b.PcId == booking.PcId && b.Status == "active" && b.Id != id);
        if (!hasOtherActive) booking.Pc.Status = "free";

        await db.SaveChangesAsync();
        return Ok(new { message = "Booking cancelled" });
    }

    // ── Admin/Manager: all bookings ───────────────────────────────────────
    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] DateTime? date)
    {
        var q = db.Bookings
            .Include(b => b.User)
            .Include(b => b.Pc)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
            q = q.Where(b => b.Status == status);

        if (date.HasValue)
        {
            var d = date.Value.Date;
            q = q.Where(b => b.StartTime.Date == d);
        }

        var list = await q.OrderByDescending(b => b.StartTime)
            .Select(b => new
            {
                b.Id, b.StartTime, b.DurationH, b.TotalPrice, b.Status, b.Notes,
                User = new { b.User.Id, b.User.Username, b.User.Email },
                Pc   = new { b.Pc.Id, b.Pc.Number, b.Pc.Zone },
            })
            .ToListAsync();
        return Ok(list);
    }

    // ── Manager: activate / complete booking ─────────────────────────────
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var booking = await db.Bookings.Include(b => b.Pc).FirstOrDefaultAsync(b => b.Id == id);
        if (booking is null) return NotFound();

        booking.Status = dto.Status;

        if (dto.Status == "active")   booking.Pc.Status = "occupied";
        if (dto.Status == "completed") booking.Pc.Status = "free";

        await db.SaveChangesAsync();
        return Ok(new { booking.Id, booking.Status });
    }

    public record CreateBookingDto(int PcId, DateTime StartTime, int DurationH, string? Notes);
    public record UpdateStatusDto(string Status);
}
