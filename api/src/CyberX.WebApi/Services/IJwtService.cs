using System.Security.Claims;
using CyberX.Data.Persistence.Entities;

namespace CyberX.WebApi.Services;

public interface IJwtService
{
    string GenerateAccessToken(UserRecord user);
    string GenerateRefreshToken();
    ClaimsPrincipal? ValidateToken(string token);
    int? GetUserIdFromToken(string token);
}
