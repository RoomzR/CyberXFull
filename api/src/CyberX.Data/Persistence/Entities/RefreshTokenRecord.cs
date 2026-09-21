namespace CyberX.Data.Persistence.Entities;

public sealed class RefreshTokenRecord
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }

    public UserRecord? User { get; set; }
}
