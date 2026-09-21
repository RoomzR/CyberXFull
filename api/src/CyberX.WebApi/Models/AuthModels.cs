namespace CyberX.WebApi.Models;

public record RegisterRequest(string Email, string Username, string Password);

public record LoginRequest(string Email, string Password);

public record RefreshRequest(string Token);

public record AuthResponse(string AccessToken, string RefreshToken, UserDto User);

public record UserDto(int Id, string Email, string Username, string Role);
