namespace CyberX.Data.Persistence.Entities;

public sealed class UserRecord
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = "Player";
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;

    public decimal Balance { get; set; } = 0;

    public ICollection<RefreshTokenRecord> RefreshTokens { get; set; } = [];
    public ICollection<BookingRecord>      Bookings      { get; set; } = [];
}
