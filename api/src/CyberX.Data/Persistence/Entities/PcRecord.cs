namespace CyberX.Data.Persistence.Entities;

public sealed class PcRecord
{
    public int     Id          { get; set; }
    public int     Number      { get; set; }   // Display number (1-45)
    public string  Zone        { get; set; } = "STANDART";  // STAGE | BOOTCAMP | STANDART
    public string  Specs       { get; set; } = string.Empty;
    public decimal HourlyRate  { get; set; }
    public string  Status      { get; set; } = "free";  // free | booked | occupied | maintenance
    public bool    IsActive    { get; set; } = true;

    public ICollection<BookingRecord> Bookings { get; set; } = [];
}
