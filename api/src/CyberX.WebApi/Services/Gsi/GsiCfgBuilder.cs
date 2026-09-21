namespace CyberX.WebApi.Services.Gsi;

public static class GsiCfgBuilder
{
    public const string FileName = "gamestate_integration_cyberx.cfg";

    /// <summary>Full CS2 GSI cfg with allplayers_* for 10-player roster on dedicated server.</summary>
    public static string Build(string uri, string token) => $$"""
"CyberX GSI Configuration"
{
    "uri" "{{uri}}"
    "timeout" "5.0"
    "buffer"  "0.1"
    "throttle" "0.1"
    "heartbeat" "30.0"
    "auth"
    {
        "token" "{{token}}"
    }
    "data"
    {
        "provider"               "1"
        "map"                    "1"
        "map_team_ct"            "1"
        "map_team_t"             "1"
        "round"                  "1"
        "player_id"              "1"
        "player_state"           "1"
        "player_weapons"         "1"
        "player_match_stats"     "1"
        "allplayers_id"          "1"
        "allplayers_state"       "1"
        "allplayers_match_stats" "1"
        "allplayers_weapons"     "1"
        "allplayers_position"    "1"
        "bomb"                   "1"
        "phase_countdowns"       "1"
        "grenades"               "1"
    }
}
""";

    public static string ClientInstallPath =>
        @"Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg\" + FileName;

    public static string DedicatedInstallPath =>
        @"csgo\cfg\" + FileName;

    public static readonly string[] PlayerHintLines =
    [
        "allplayers_* работает только на DEDICATED SERVER (не на локальном listen).",
        "Cfg на dedicated = все 10 игроков сразу. Альтернатива: тот же cfg каждому игроку на ПК — API соберёт roster по steamid.",
        "Боты в GSI не приходят — нужны живые игроки с установленным cfg или dedicated.",
        "После установки cfg — полный перезапуск CS2 / сервера, затем зайти в матч.",
        "Public Host в админке = IP:port API, доступный с игрового сервера.",
    ];
}
