namespace CyberX.Data.Persistence.Entities;

public sealed class EventRecord
{
    public int Id { get; set; }
    public required string TitleRu { get; set; }
    public required string TitleEn { get; set; }
    public required string DescriptionRu { get; set; }
    public required string DescriptionEn { get; set; }
    public required string Type { get; set; }
    public DateTime Date { get; set; }
    public required string ImageGradient { get; set; }
}
