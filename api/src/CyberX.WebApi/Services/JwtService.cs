using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CyberX.Data.Persistence.Entities;
using Microsoft.IdentityModel.Tokens;

namespace CyberX.WebApi.Services;

public sealed class JwtService(IConfiguration config) : IJwtService
{
    private string Secret       => config["Jwt:SecretKey"]!;
    private string Issuer       => config["Jwt:Issuer"]!;
    private string Audience     => config["Jwt:Audience"]!;
    private int    AccessMinutes => int.Parse(config["Jwt:AccessTokenExpiryMinutes"] ?? "60");

    public string GenerateAccessToken(UserRecord user)
    {
        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,   user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Role,               user.Role),
            new Claim("username",                    user.Username),
        };

        var token = new JwtSecurityToken(
            issuer:            Issuer,
            audience:          Audience,
            claims:            claims,
            expires:           DateTime.UtcNow.AddMinutes(AccessMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var key     = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret));

        try
        {
            return handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey         = key,
                ValidateIssuer           = true,
                ValidIssuer              = Issuer,
                ValidateAudience         = true,
                ValidAudience            = Audience,
                ValidateLifetime         = true,
                ClockSkew                = TimeSpan.Zero,
            }, out _);
        }
        catch
        {
            return null;
        }
    }

    public int? GetUserIdFromToken(string token)
    {
        var principal = ValidateToken(token);
        if (principal is null) return null;
        var sub = principal.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return int.TryParse(sub, out var id) ? id : null;
    }
}
