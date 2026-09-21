using CyberX.Business.DTOs;
using CyberX.Business.Services;
using Microsoft.AspNetCore.Mvc;

namespace CyberX.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class TournamentsController(IClubService clubService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<TournamentDto>>(StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<TournamentDto>> GetAll() =>
        Ok(clubService.GetTournaments());
}
