namespace CyberX.Data.Persistence.Entities;

public sealed class FaqRecord
{
    public int Id { get; set; }
    public required string QuestionRu { get; set; }
    public required string QuestionEn { get; set; }
    public required string AnswerRu { get; set; }
    public required string AnswerEn { get; set; }
    public int Order { get; set; }
}
