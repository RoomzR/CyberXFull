using CyberX.Business.DTOs;
using CyberX.Business.Services;
using Microsoft.AspNetCore.Mvc;

namespace CyberX.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class TeamsController(IClubService clubService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<TeamDto>>(StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<TeamDto>> GetAll([FromQuery] int? limit) =>
        Ok(clubService.GetTeams(limit));
}
