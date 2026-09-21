using CyberX.Domain.Common;

namespace CyberX.Domain.Entities;

public sealed class ClubInfo
{
    public required LocalizedText Name { get; init; }
    public required LocalizedText Tagline { get; init; }
    public required LocalizedText About { get; init; }
    public required string Phone { get; init; }
    public required string Address { get; init; }
    public required string City { get; init; }
    public required string Country { get; init; }
    public required string InstagramUrl { get; init; }
    public required string TelegramUrl { get; init; }
    public required string[] SupportedGames { get; init; }
}
