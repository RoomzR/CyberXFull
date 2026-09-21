namespace CyberX.Data.Persistence.Entities;

public sealed class MatchRecord
{
    public int      Id           { get; set; }
    public int      ServerId     { get; set; }
    public string   MapName      { get; set; } = string.Empty;
    public string   Mode         { get; set; } = "competitive";
    public string   TeamCtName   { get; set; } = "Counter-Terrorists";
    public string   TeamTName    { get; set; } = "Terrorists";
    public int      ScoreCt      { get; set; }
    public int      ScoreT       { get; set; }
    public int      TotalRounds  { get; set; }
    public string   Status       { get; set; } = "live"; // live | completed
    public DateTime StartedAt    { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt     { get; set; }

    public GameServerRecord Server { get; set; } = null!;
    public ICollection<MatchPlayerStatRecord> PlayerStats { get; set; } = [];
}
