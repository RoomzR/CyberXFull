using CyberX.Business.DTOs;
using CyberX.Domain.Common;
using CyberX.Domain.Entities;
using CyberX.Domain.Interfaces;

namespace CyberX.Business.Services;

public sealed class TournamentAdminService(ITournamentRepository repository) : ITournamentAdminService
{
    public IReadOnlyList<TournamentAdminDto> GetAll() =>
        repository.GetAll().Select(Map).ToList();

    public TournamentAdminDto? GetById(int id)
    {
        var t = repository.GetById(id);
        return t is null ? null : Map(t);
    }

    public int Create(CreateTournamentRequest request)
    {
        var tournament = FromRequest(request);
        return repository.Create(tournament);
    }

    public void Update(int id, UpdateTournamentRequest request)
    {
        _ = repository.GetById(id)
            ?? throw new KeyNotFoundException($"Tournament {id} not found");

        repository.Update(new Tournament
        {
            Id = id,
            Title = Lt(request.TitleRu, request.TitleEn),
            Description = Lt(request.DescriptionRu, request.DescriptionEn),
            Game = request.Game,
            Status = request.Status,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            PrizePool = request.PrizePool,
            RegistrationUrl = request.RegistrationUrl,
            RulesUrl = request.RulesUrl,
            IsFeatured = request.IsFeatured
        });
    }

    public void Delete(int id) => repository.Delete(id);

    private static TournamentAdminDto Map(Tournament t) => new(
        t.Id, t.Title.Ru, t.Title.En, t.Description.Ru, t.Description.En,
        t.Game, t.Status, t.StartDate, t.EndDate, t.PrizePool,
        t.RegistrationUrl, t.RulesUrl, t.IsFeatured);

    private static Tournament FromRequest(CreateTournamentRequest r) => new()
    {
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

    private static LocalizedText Lt(string ru, string en) => new() { Ru = ru, En = en };
}
