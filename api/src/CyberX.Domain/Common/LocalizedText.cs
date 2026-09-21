namespace CyberX.Domain.Common;

public sealed class LocalizedText
{
    public required string Ru { get; init; }
    public required string En { get; init; }

    public string Resolve(string culture) =>
        culture.StartsWith("en", StringComparison.OrdinalIgnoreCase) ? En : Ru;
}
