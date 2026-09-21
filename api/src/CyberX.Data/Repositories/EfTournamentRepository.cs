using CyberX.Data.Persistence;
using CyberX.Data.Persistence.Entities;
using CyberX.Domain.Entities;
using CyberX.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CyberX.Data.Repositories;

public sealed class EfTournamentRepository(CyberXDbContext db) : ITournamentRepository
{
    public IReadOnlyList<Tournament> GetAll() =>
        db.Tournaments.AsNoTracking()
            .OrderByDescending(t => t.StartDate)
            .AsEnumerable()
            .Select(EntityMapper.ToDomain)
            .ToList();

    public Tournament? GetById(int id)
    {
        var record = db.Tournaments.AsNoTracking().FirstOrDefault(t => t.Id == id);
        return record is null ? null : EntityMapper.ToDomain(record);
    }

    public int Create(Tournament tournament)
    {
        var record = EntityMapper.ToRecord(tournament);
        record.Id = 0;
        db.Tournaments.Add(record);
        db.SaveChanges();
        return record.Id;
    }

    public void Update(Tournament tournament)
    {
        var record = db.Tournaments.FirstOrDefault(t => t.Id == tournament.Id)
            ?? throw new KeyNotFoundException($"Tournament {tournament.Id} not found");

        Apply(record, tournament);
        db.SaveChanges();
    }

    public void Delete(int id)
    {
        var record = db.Tournaments.FirstOrDefault(t => t.Id == id);
        if (record is null) return;
        db.Tournaments.Remove(record);
        db.SaveChanges();
    }

    private static void Apply(TournamentRecord record, Tournament tournament)
    {
        record.TitleRu = tournament.Title.Ru;
        record.TitleEn = tournament.Title.En;
        record.DescriptionRu = tournament.Description.Ru;
        record.DescriptionEn = tournament.Description.En;
        record.Game = tournament.Game;
        record.Status = tournament.Status;
        record.StartDate = tournament.StartDate;
        record.EndDate = tournament.EndDate;
        record.PrizePool = tournament.PrizePool;
        record.RegistrationUrl = tournament.RegistrationUrl;
        record.RulesUrl = tournament.RulesUrl;
        record.IsFeatured = tournament.IsFeatured;
    }
}
