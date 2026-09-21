namespace CyberX.Data.Persistence.Entities;

public sealed class MatchSeriesRecord
{
    public int      Id         { get; set; }
    public int?     ServerId   { get; set; }
    public string   Team1Name  { get; set; } = string.Empty;
    public string   Team2Name  { get; set; } = string.Empty;
    public string   Format     { get; set; } = "bo1";
    public string   Status     { get; set; } = "veto"; // veto | live | finished
    public DateTime CreatedAt  { get; set; } = DateTime.UtcNow;

    public GameServerRecord? Server { get; set; }
    public ICollection<MatchVetoActionRecord> VetoActions { get; set; } = [];
}

public sealed class MatchVetoActionRecord
{
    public int      Id           { get; set; }
    public int      SeriesId     { get; set; }
    public int      StepOrder    { get; set; }
    public string   Action       { get; set; } = "ban"; // ban | pick | decider
    public string   MapName      { get; set; } = string.Empty;
    public string   Team         { get; set; } = "team1"; // team1 | team2
    public string?  SideNote     { get; set; } // e.g. "Xcity starts CT"
    public DateTime CreatedAt    { get; set; } = DateTime.UtcNow;

    public MatchSeriesRecord Series { get; set; } = null!;
}
