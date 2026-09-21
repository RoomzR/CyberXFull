using CyberX.Business.DTOs;

namespace CyberX.Business.Services;

public interface ITournamentAdminService
{
    IReadOnlyList<TournamentAdminDto> GetAll();
    TournamentAdminDto? GetById(int id);
    int Create(CreateTournamentRequest request);
    void Update(int id, UpdateTournamentRequest request);
    void Delete(int id);
}
