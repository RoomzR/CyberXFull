namespace CyberX.Business.DTOs;

public sealed record ClubInfoDto(
    string Name,
    string Tagline,
    string About,
    string Phone,
    string Address,
    string City,
    string Country,
    string InstagramUrl,
    string TelegramUrl,
    IReadOnlyList<string> SupportedGames);

public sealed record TournamentDto(
    int Id,
    string Title,
    string Description,
    string Game,
    string Status,
    DateTime StartDate,
    DateTime? EndDate,
    int PrizePool,
    string RegistrationUrl,
    string RulesUrl,
    bool IsFeatured);

public sealed record TeamDto(
    int Id,
    string Name,
    string Tag,
    int Rating,
    int Wins,
    int Losses,
    string PrimaryGame,
    string LogoColor);

public sealed record EventDto(
    int Id,
    string Title,
    string Description,
    string Type,
    DateTime Date,
    string ImageGradient);

public sealed record FaqItemDto(int Id, string Question, string Answer, int Order);

public sealed record HomePageDto(
    ClubInfoDto Club,
    IReadOnlyList<TournamentDto> FeaturedTournaments,
    IReadOnlyList<EventDto> RecentEvents,
    IReadOnlyList<TeamDto> TopTeams,
    IReadOnlyList<FaqItemDto> Faq);
