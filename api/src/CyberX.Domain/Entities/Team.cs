namespace CyberX.Domain.Entities;

public sealed class Team
{
    public int Id { get; init; }
    public required string Name { get; init; }
    public required string Tag { get; init; }
    public int Rating { get; init; }
    public int Wins { get; init; }
    public int Losses { get; init; }
    public required string PrimaryGame { get; init; }
    public required string LogoColor { get; init; }
}
