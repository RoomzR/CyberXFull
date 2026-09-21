using CyberX.Domain.Common;

namespace CyberX.Domain.Entities;

public sealed class Tournament
{
    public int Id { get; init; }
    public required LocalizedText Title { get; init; }
    public required LocalizedText Description { get; init; }
    public required string Game { get; init; }
    public required string Status { get; init; }
    public DateTime StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public int PrizePool { get; init; }
    public required string RegistrationUrl { get; init; }
    public required string RulesUrl { get; init; }
    public bool IsFeatured { get; init; }
}
