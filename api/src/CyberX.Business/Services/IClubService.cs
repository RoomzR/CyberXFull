using CyberX.Business.DTOs;

namespace CyberX.Business.Services;

public interface IClubService
{
    ClubInfoDto GetClubInfo();
    IReadOnlyList<TournamentDto> GetTournaments();
    IReadOnlyList<TeamDto> GetTeams(int? limit = null);
    IReadOnlyList<EventDto> GetEvents(int? limit = null);
    IReadOnlyList<FaqItemDto> GetFaq();
    HomePageDto GetHomePage();
}
