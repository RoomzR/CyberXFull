using CyberX.Business.DTOs;
using CyberX.Business.Services;
using Microsoft.AspNetCore.Mvc;

namespace CyberX.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class FaqController(IClubService clubService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<FaqItemDto>>(StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<FaqItemDto>> GetAll() =>
        Ok(clubService.GetFaq());
}
