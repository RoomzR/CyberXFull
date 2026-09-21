using CyberX.Data.Persistence;
using CyberX.Domain.Entities;
using CyberX.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CyberX.Data.Repositories;

public sealed class EfClubRepository(CyberXDbContext db) : IClubRepository
{
    public ClubInfo GetClubInfo()
    {
        var record = db.Clubs.AsNoTracking().First();
        return EntityMapper.ToDomain(record);
    }

    public IReadOnlyList<Team> GetTeams() =>
        db.Teams.AsNoTracking().AsEnumerable().Select(EntityMapper.ToDomain).ToList();

    public IReadOnlyList<ClubEvent> GetEvents() =>
        db.Events.AsNoTracking().AsEnumerable().Select(EntityMapper.ToDomain).ToList();

    public IReadOnlyList<FaqItem> GetFaqItems() =>
        db.FaqItems.AsNoTracking().AsEnumerable().Select(EntityMapper.ToDomain).ToList();
}
