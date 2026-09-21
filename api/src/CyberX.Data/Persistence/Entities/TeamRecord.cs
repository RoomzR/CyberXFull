namespace CyberX.Data.Persistence.Entities;

public sealed class TeamRecord
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Tag { get; set; }
    public int Rating { get; set; }
    public int Wins { get; set; }
    public int Losses { get; set; }
    public required string PrimaryGame { get; set; }
    public required string LogoColor { get; set; }
}
