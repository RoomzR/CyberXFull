namespace CyberX.WebApi.Services.Stats;

/// <summary>
/// HLTV Rating 2.0 — official coefficient model with KAST, Impact, ADR.
/// ADR estimated from GSI score when damage not available.
/// </summary>
public static class HltvRating
{
    private const double AvgKpr = 0.679;
    private const double AvgDpr = 0.679;
    private const double AvgApr = 0.184;
    private const double AvgAdr = 80.2;

    /// <summary>Effective rounds for rating — avoids inflated values in round 1–2.</summary>
    public static int EffectiveRounds(int kills, int deaths, int matchRound) =>
        Math.Max(Math.Max(matchRound, kills + deaths), 3);

    public static double Calculate2(int kills, int deaths, int assists, int rounds, int mvps = 0, int score = 0, double? adr = null)
    {
        rounds = EffectiveRounds(kills, deaths, rounds);
        var kpr = (double)kills / rounds;
        var dpr = (double)deaths / rounds;
        var apr = (double)assists / rounds;

        // KAST (%)
        var kastRounds = Math.Min(rounds, kills + assists + Math.Max(0, rounds - deaths));
        var kast = Math.Min(100.0, kastRounds / (double)rounds * 100.0);

        // Impact (~1.0 = average pro)
        var impact = 2.13 * kpr + 0.42 * apr - 0.41;
        if (mvps > 0) impact += mvps / (double)rounds * 1.2;

        // ADR from GSI damage or score proxy
        var adrVal = adr ?? (score > 0
            ? Math.Clamp(score / (double)rounds * 2.85, 25, 160)
            : AvgAdr);

        // HLTV Rating 2.0
        var rating = 0.0073 * kast
                   + 0.3591 * kpr
                   - 0.5329 * dpr
                   + 0.2372 * impact
                   + 0.0032 * adrVal
                   + 0.1587;

        return Math.Round(Math.Clamp(rating, 0.01, 3.50), 2);
    }

    /// <summary>
    /// Rating 3.0 style — normalizes K/D/A vs pro averages, then blends with 2.0.
    /// Average pro ≈ 1.00.
    /// </summary>
    public static double Calculate3(int kills, int deaths, int assists, int rounds, int mvps = 0, int score = 0, double? adr = null)
    {
        rounds = EffectiveRounds(kills, deaths, rounds);
        var kpr = (double)kills / rounds;
        var dpr = (double)deaths / rounds;
        var apr = (double)assists / rounds;

        var killRating = kpr / AvgKpr;
        var survRating = Math.Max(0.01, (rounds - deaths) / (double)rounds) / (1.0 - AvgDpr + 0.01);
        var assistRating = apr / AvgApr;

        var adrVal = adr ?? (score > 0 ? score / (double)rounds * 2.85 : AvgAdr);
        var dmgRating = adrVal / AvgAdr;

        var r3 = killRating * 0.40 + survRating * 0.20 + assistRating * 0.10 + dmgRating * 0.25;
        if (mvps > 0) r3 += mvps / (double)rounds * 0.15;

        // Blend with 2.0 for stability
        var r2 = Calculate2(kills, deaths, assists, rounds, mvps, score, adr);
        return Math.Round(Math.Clamp(r3 * 0.55 + r2 * 0.45, 0.01, 3.50), 2);
    }
}
