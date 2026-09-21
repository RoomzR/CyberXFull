namespace CyberX.Data.Persistence.Entities;

public sealed class BookingRecord
{
    public int      Id          { get; set; }
    public int      UserId      { get; set; }
    public int      PcId        { get; set; }
    public DateTime StartTime   { get; set; }
    public int      DurationH   { get; set; }  // hours
    public DateTime EndTime     => StartTime.AddHours(DurationH);
    public decimal  TotalPrice  { get; set; }
    public string   Status      { get; set; } = "pending"; // pending | active | completed | cancelled
    public DateTime CreatedAt   { get; set; } = DateTime.UtcNow;
    public string?  Notes       { get; set; }

    public UserRecord    User { get; set; } = null!;
    public PcRecord      Pc   { get; set; } = null!;
}
