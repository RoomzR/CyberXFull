namespace CyberX.Data.Persistence.Entities;

public sealed class TournamentRecord
{
    public int Id { get; set; }
    public required string TitleRu { get; set; }
    public required string TitleEn { get; set; }
    public required string DescriptionRu { get; set; }
    public required string DescriptionEn { get; set; }
    public required string Game { get; set; }
    public required string Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int PrizePool { get; set; }
    public required string RegistrationUrl { get; set; }
    public required string RulesUrl { get; set; }
    public bool IsFeatured { get; set; }
}
