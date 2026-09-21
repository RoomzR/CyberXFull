using CyberX.Domain.Entities;

namespace CyberX.Domain.Interfaces;

public interface ITournamentRepository
{
    IReadOnlyList<Tournament> GetAll();
    Tournament? GetById(int id);
    int Create(Tournament tournament);
    void Update(Tournament tournament);
    void Delete(int id);
}
