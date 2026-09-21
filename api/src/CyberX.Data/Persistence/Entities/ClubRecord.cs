namespace CyberX.Data.Persistence.Entities;

public sealed class ClubRecord
{
    public int Id { get; set; }
    public required string NameRu { get; set; }
    public required string NameEn { get; set; }
    public required string TaglineRu { get; set; }
    public required string TaglineEn { get; set; }
    public required string AboutRu { get; set; }
    public required string AboutEn { get; set; }
    public required string Phone { get; set; }
    public required string Address { get; set; }
    public required string City { get; set; }
    public required string Country { get; set; }
    public required string InstagramUrl { get; set; }
    public required string TelegramUrl { get; set; }
    public required string SupportedGamesJson { get; set; }
}
