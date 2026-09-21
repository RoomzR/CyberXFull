namespace CyberX.Data.Persistence.Entities;

public sealed class MatchPlayerStatRecord
{
    public int     Id         { get; set; }
    public int     MatchId    { get; set; }
    public string  SteamId    { get; set; } = string.Empty;
    public string  PlayerName { get; set; } = string.Empty;
    public string  Team       { get; set; } = "CT"; // CT | T
    public int     Kills      { get; set; }
    public int     Deaths     { get; set; }
    public int     Assists    { get; set; }
    public int     Mvps       { get; set; }
    public int     Score      { get; set; }
    public int     Headshots  { get; set; }

    public MatchRecord Match { get; set; } = null!;

    public double Kd => Deaths > 0 ? Math.Round((double)Kills / Deaths, 2) : Kills;
    public double HsPct => Kills > 0 ? Math.Round((double)Headshots / Kills * 100, 1) : 0;
}
