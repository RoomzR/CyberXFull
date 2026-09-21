using CyberX.Domain.Common;

namespace CyberX.Domain.Entities;

public sealed class ClubEvent
{
    public int Id { get; init; }
    public required LocalizedText Title { get; init; }
    public required LocalizedText Description { get; init; }
    public required string Type { get; init; }
    public DateTime Date { get; init; }
    public required string ImageGradient { get; init; }
}
