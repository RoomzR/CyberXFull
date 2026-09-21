namespace CyberX.Business.DTOs;

public sealed record TournamentAdminDto(
    int Id,
    string TitleRu,
    string TitleEn,
    string DescriptionRu,
    string DescriptionEn,
    string Game,
    string Status,
    DateTime StartDate,
    DateTime? EndDate,
    int PrizePool,
    string RegistrationUrl,
    string RulesUrl,
    bool IsFeatured);

public sealed record CreateTournamentRequest(
    string TitleRu,
    string TitleEn,
    string DescriptionRu,
    string DescriptionEn,
    string Game,
    string Status,
    DateTime StartDate,
    DateTime? EndDate,
    int PrizePool,
    string RegistrationUrl,
    string RulesUrl,
    bool IsFeatured);

public sealed record UpdateTournamentRequest(
    string TitleRu,
    string TitleEn,
    string DescriptionRu,
    string DescriptionEn,
    string Game,
    string Status,
    DateTime StartDate,
    DateTime? EndDate,
    int PrizePool,
    string RegistrationUrl,
    string RulesUrl,
    bool IsFeatured);
