using System.Text.Json;
using CyberX.Data.Persistence.Entities;
using CyberX.Domain.Common;
using CyberX.Domain.Entities;

namespace CyberX.Data.Persistence;

internal static class EntityMapper
{
    private static readonly JsonSerializerOptions JsonOptions = new();

    public static Tournament ToDomain(TournamentRecord r) => new()
    {
        Id = r.Id,
        Title = Lt(r.TitleRu, r.TitleEn),
        Description = Lt(r.DescriptionRu, r.DescriptionEn),
        Game = r.Game,
        Status = r.Status,
        StartDate = r.StartDate,
        EndDate = r.EndDate,
        PrizePool = r.PrizePool,
        RegistrationUrl = r.RegistrationUrl,
        RulesUrl = r.RulesUrl,
        IsFeatured = r.IsFeatured
    };

    public static TournamentRecord ToRecord(Tournament t) => new()
    {
        Id = t.Id,
        TitleRu = t.Title.Ru,
        TitleEn = t.Title.En,
        DescriptionRu = t.Description.Ru,
        DescriptionEn = t.Description.En,
        Game = t.Game,
        Status = t.Status,
        StartDate = t.StartDate,
        EndDate = t.EndDate,
        PrizePool = t.PrizePool,
        RegistrationUrl = t.RegistrationUrl,
        RulesUrl = t.RulesUrl,
        IsFeatured = t.IsFeatured
    };

    public static Team ToDomain(TeamRecord r) => new()
    {
        Id = r.Id,
        Name = r.Name,
        Tag = r.Tag,
        Rating = r.Rating,
        Wins = r.Wins,
        Losses = r.Losses,
        PrimaryGame = r.PrimaryGame,
        LogoColor = r.LogoColor
    };

    public static ClubEvent ToDomain(EventRecord r) => new()
    {
        Id = r.Id,
        Title = Lt(r.TitleRu, r.TitleEn),
        Description = Lt(r.DescriptionRu, r.DescriptionEn),
        Type = r.Type,
        Date = r.Date,
        ImageGradient = r.ImageGradient
    };

    public static FaqItem ToDomain(FaqRecord r) => new()
    {
        Id = r.Id,
        Question = Lt(r.QuestionRu, r.QuestionEn),
        Answer = Lt(r.AnswerRu, r.AnswerEn),
        Order = r.Order
    };

    public static ClubInfo ToDomain(ClubRecord r) => new()
    {
        Name = Lt(r.NameRu, r.NameEn),
        Tagline = Lt(r.TaglineRu, r.TaglineEn),
        About = Lt(r.AboutRu, r.AboutEn),
        Phone = r.Phone,
        Address = r.Address,
        City = r.City,
        Country = r.Country,
        InstagramUrl = r.InstagramUrl,
        TelegramUrl = r.TelegramUrl,
        SupportedGames = JsonSerializer.Deserialize<string[]>(r.SupportedGamesJson, JsonOptions) ?? []
    };

    private static LocalizedText Lt(string ru, string en) => new() { Ru = ru, En = en };
}
