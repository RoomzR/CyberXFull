namespace CyberX.WebApi.Services.Gsi;

public sealed class LivePlayerState
{
    public string SteamId    { get; set; } = string.Empty;
    public string Name       { get; set; } = string.Empty;
    public string Team       { get; set; } = "CT";
    public int    Kills      { get; set; }
    public int    Deaths     { get; set; }
    public int    Assists    { get; set; }
    public int    Mvps       { get; set; }
    public int    Score      { get; set; }
    public int    Headshots  { get; set; }
    public int    Health     { get; set; }
    public int    Armor      { get; set; }
    public int    Damage     { get; set; }
    public int    Money      { get; set; }
    public bool   HasHelmet  { get; set; }
    public bool   Alive      { get; set; }
    public string? Weapon    { get; set; }
    public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;

    public double Kd    => Deaths > 0 ? Math.Round((double)Kills / Deaths, 2) : Kills;
    public double HsPct => Kills > 0 ? Math.Round((double)Headshots / Kills * 100, 1) : 0;
}

public sealed class LiveMatchState
{
    public int    MatchId     { get; set; }
    public string MapName     { get; set; } = string.Empty;
    public string Mode        { get; set; } = "competitive";
    public string MapPhase    { get; set; } = "live";
    public string RoundPhase  { get; set; } = "live";
    public int    Round       { get; set; }
    public int    ScoreCt     { get; set; }
    public int    ScoreT      { get; set; }
    public string TeamCtName  { get; set; } = "Counter-Terrorists";
    public string TeamTName   { get; set; } = "Terrorists";
    public string? BombState  { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<LivePlayerState> Players { get; set; } = [];
}

public sealed class LiveServerState
{
    public int      ServerId    { get; set; }
    public string   ServerName  { get; set; } = string.Empty;
    public int?     LinkedPc    { get; set; }
    public bool     IsOnline    { get; set; }
    public DateTime? LastGsiAt  { get; set; }
    public LiveMatchState? Match { get; set; }
}
