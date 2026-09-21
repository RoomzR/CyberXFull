using CyberX.Domain.Common;

namespace CyberX.Domain.Entities;

public sealed class FaqItem
{
    public int Id { get; init; }
    public required LocalizedText Question { get; init; }
    public required LocalizedText Answer { get; init; }
    public int Order { get; init; }
}
