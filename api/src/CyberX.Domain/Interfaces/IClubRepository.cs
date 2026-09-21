using CyberX.Domain.Entities;

namespace CyberX.Domain.Interfaces;

public interface IClubRepository
{
    ClubInfo GetClubInfo();
    IReadOnlyList<Team> GetTeams();
    IReadOnlyList<ClubEvent> GetEvents();
    IReadOnlyList<FaqItem> GetFaqItems();
}
