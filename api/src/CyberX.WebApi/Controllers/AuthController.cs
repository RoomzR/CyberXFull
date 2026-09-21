using CyberX.Data.Persistence;
using CyberX.Data.Persistence.Entities;
using CyberX.WebApi.Models;
using CyberX.WebApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CyberX.WebApi.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    CyberXDbContext  db,
    IJwtService      jwt,
    IPasswordService passwords,
    IConfiguration   config) : ControllerBase
{
    [HttpPost("register")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) ||
            string.IsNullOrWhiteSpace(req.Username) ||
            string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "Email, username and password are required." });

        var email = req.Email.ToLowerInvariant().Trim();

        if (await db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new { message = "Email already registered." });

        var user = new UserRecord
        {
            Email        = email,
            Username     = req.Username.Trim(),
            PasswordHash = passwords.Hash(req.Password),
            Role         = "Player",
            CreatedAt    = DateTime.UtcNow,
            IsActive     = true,
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return Ok(await BuildAuthResponse(user));
    }

    [HttpPost("login")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var email = req.Email.ToLowerInvariant().Trim();
        var user  = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user is null || !passwords.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials." });

        if (!user.IsActive)
            return Unauthorized(new { message = "Account is disabled." });

        user.LastLoginAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(await BuildAuthResponse(user));
    }

    [HttpPost("refresh")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest req)
    {
        var token = await db.RefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t =>
                t.Token == req.Token &&
                !t.IsRevoked &&
                t.ExpiresAt > DateTime.UtcNow);

        if (token?.User is null || !token.User.IsActive)
            return Unauthorized(new { message = "Invalid or expired refresh token." });

        token.IsRevoked = true;
        await db.SaveChangesAsync();

        return Ok(await BuildAuthResponse(token.User));
    }

    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout([FromBody] RefreshRequest req)
    {
        var token = await db.RefreshTokens.FirstOrDefaultAsync(t => t.Token == req.Token);
        if (token is not null)
        {
            token.IsRevoked = true;
            await db.SaveChangesAsync();
        }
        return NoContent();
    }

    [HttpGet("me")]
    [ProducesResponseType<UserDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Me()
    {
        var bearer = Request.Headers.Authorization.ToString();
        if (!bearer.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return Unauthorized();

        var rawToken = bearer["Bearer ".Length..].Trim();
        var userId   = jwt.GetUserIdFromToken(rawToken);
        if (userId is null) return Unauthorized();

        var user = await db.Users.FindAsync(userId.Value);
        if (user is null || !user.IsActive) return Unauthorized();

        return Ok(new UserDto(user.Id, user.Email, user.Username, user.Role));
    }

    private async Task<AuthResponse> BuildAuthResponse(UserRecord user)
    {
        var refreshDays  = int.Parse(config["Jwt:RefreshTokenExpiryDays"] ?? "30");
        var accessToken  = jwt.GenerateAccessToken(user);
        var refreshToken = jwt.GenerateRefreshToken();

        db.RefreshTokens.Add(new RefreshTokenRecord
        {
            UserId    = user.Id,
            Token     = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(refreshDays),
            IsRevoked = false,
        });
        await db.SaveChangesAsync();

        return new AuthResponse(
            accessToken,
            refreshToken,
            new UserDto(user.Id, user.Email, user.Username, user.Role));
    }
}
