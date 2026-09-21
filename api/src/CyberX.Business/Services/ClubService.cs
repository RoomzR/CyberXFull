using System.Globalization;
using CyberX.Business.DTOs;
using CyberX.Domain.Entities;
using CyberX.Domain.Interfaces;

namespace CyberX.Business.Services;

public sealed class ClubService(IClubRepository repository, ITournamentRepository tournaments) : IClubService
{
    private string Culture => CultureInfo.CurrentCulture.TwoLetterISOLanguageName;

    public ClubInfoDto GetClubInfo() => MapClub(repository.GetClubInfo());

    public IReadOnlyList<TournamentDto> GetTournaments() =>
        tournaments.GetAll().Select(MapTournament).ToList();

    public IReadOnlyList<TeamDto> GetTeams(int? limit = null)
    {
        var query = repository.GetTeams().OrderByDescending(t => t.Rating).AsEnumerable();
        if (limit.HasValue)
            query = query.Take(limit.Value);
        return query.Select(MapTeam).ToList();
    }

    public IReadOnlyList<EventDto> GetEvents(int? limit = null)
    {
        var query = repository.GetEvents().OrderByDescending(e => e.Date).AsEnumerable();
        if (limit.HasValue)
            query = query.Take(limit.Value);
        return query.Select(MapEvent).ToList();
    }

    public IReadOnlyList<FaqItemDto> GetFaq() =>
        repository.GetFaqItems().OrderBy(f => f.Order).Select(MapFaq).ToList();

    public HomePageDto GetHomePage()
    {
        var club = GetClubInfo();
        var tournaments = GetTournaments().Where(t => t.IsFeatured).Take(3).ToList();
        var events = GetEvents(6);
        var teams = GetTeams(10);
        var faq = GetFaq();

        return new HomePageDto(club, tournaments, events, teams, faq);
    }

    private ClubInfoDto MapClub(ClubInfo club) => new(
        club.Name.Resolve(Culture),
        club.Tagline.Resolve(Culture),
        club.About.Resolve(Culture),
        club.Phone,
        club.Address,
        club.City,
        club.Country,
        club.InstagramUrl,
        club.TelegramUrl,
        club.SupportedGames);

    private TournamentDto MapTournament(Tournament t) => new(
        t.Id,
        t.Title.Resolve(Culture),
        t.Description.Resolve(Culture),
        t.Game,
        t.Status,
        t.StartDate,
        t.EndDate,
        t.PrizePool,
        t.RegistrationUrl,
        t.RulesUrl,
        t.IsFeatured);

    private static TeamDto MapTeam(Team t) => new(
        t.Id, t.Name, t.Tag, t.Rating, t.Wins, t.Losses, t.PrimaryGame, t.LogoColor);

    private EventDto MapEvent(ClubEvent e) => new(
        e.Id,
        e.Title.Resolve(Culture),
        e.Description.Resolve(Culture),
        e.Type,
        e.Date,
        e.ImageGradient);

    private FaqItemDto MapFaq(FaqItem f) => new(
        f.Id,
        f.Question.Resolve(Culture),
        f.Answer.Resolve(Culture),
        f.Order);
}
