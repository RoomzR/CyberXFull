namespace CyberX.Domain.Entities;

public sealed class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = UserRoles.Player;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;
}

public static class UserRoles
{
    public const string Admin   = "Admin";
    public const string Manager = "Manager";
    public const string Player  = "Player";
}
