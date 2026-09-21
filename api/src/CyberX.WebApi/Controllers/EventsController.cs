using CyberX.Business.DTOs;
using CyberX.Business.Services;
using Microsoft.AspNetCore.Mvc;

namespace CyberX.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class EventsController(IClubService clubService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<EventDto>>(StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<EventDto>> GetAll([FromQuery] int? limit) =>
        Ok(clubService.GetEvents(limit));
}
