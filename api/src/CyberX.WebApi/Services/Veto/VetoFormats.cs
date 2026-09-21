namespace CyberX.WebApi.Services.Veto;

public static class VetoFormats
{
    public sealed record Step(string Action, string Team, string? MapRole = null);

    /// <summary>BO1: 6 bans on 7-map pool → 1 map remains.</summary>
    private static readonly Step[] Bo1Steps =
    [
        new("ban", "team1"),
        new("ban", "team2"),
        new("ban", "team1"),
        new("ban", "team2"),
        new("ban", "team1"),
        new("ban", "team2"),
    ];

    /// <summary>BO2 / BO3 MR3: ban ban pick pick ban ban → decider.</summary>
    private static readonly Step[] Bo3Steps =
    [
        new("ban", "team1"),
        new("ban", "team2"),
        new("pick", "team1", "pick1"),
        new("pick", "team2", "pick2"),
        new("ban", "team1"),
        new("ban", "team2"),
        new("decider", "team1", "decider"),
    ];

    private static readonly Step[] Bo5Steps =
    [
        new("ban", "team1"),
        new("ban", "team2"),
        new("pick", "team1", "map1"),
        new("pick", "team2", "map2"),
        new("pick", "team1", "map3"),
        new("pick", "team2", "map4"),
        new("decider", "team1", "map5"),
    ];

    public static IReadOnlyList<Step> GetSteps(string format) =>
        format.ToLowerInvariant() switch
        {
            "bo1" => Bo1Steps,
            "bo5" => Bo5Steps,
            _     => Bo3Steps, // bo2, bo3
        };

    public static int GetTotalSteps(string format) => GetSteps(format).Count;

    public static Step? GetStepAt(string format, int index) =>
        index >= 0 && index < GetSteps(format).Count ? GetSteps(format)[index] : null;

    public static int MapsPlayed(string format) => format.ToLowerInvariant() switch
    {
        "bo2" => 2,
        "bo3" => 3,
        "bo5" => 5,
        _     => 1,
    };

    public static string[] PlayableRoles(string format) => format.ToLowerInvariant() switch
    {
        "bo1" => ["map1"],
        "bo2" => ["pick1", "decider"],
        "bo3" => ["pick1", "pick2", "decider"],
        "bo5" => ["map1", "map2", "map3", "map4", "map5"],
        _     => ["map1"],
    };

    public static bool IsBanOnlyFormat(string format) =>
        format.Equals("bo1", StringComparison.OrdinalIgnoreCase);

    /// <summary>Remaining map after all BO1 bans (7-map pool, 6 bans).</summary>
    public static string? GetBo1RemainingMap(IEnumerable<string> bannedMaps)
    {
        var banned = bannedMaps.ToHashSet(StringComparer.Ordinal);
        var left = ActiveDutyMaps.Where(m => !banned.Contains(m)).ToList();
        return left.Count == 1 ? left[0] : null;
    }

    public static readonly string[] ActiveDutyMaps =
    [
        "de_overpass", "de_nuke", "de_dust2", "de_inferno",
        "de_ancient", "de_mirage", "de_anubis",
    ];
}
