using CyberX.Business.DTOs;
using CyberX.Business.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace CyberX.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ClubController(
    IClubService clubService,
    IStringLocalizer<SharedResources> localizer) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<ClubInfoDto>(StatusCodes.Status200OK)]
    public ActionResult<ClubInfoDto> Get() => Ok(clubService.GetClubInfo());

    [HttpGet("home")]
    [ProducesResponseType<HomePageDto>(StatusCodes.Status200OK)]
    public ActionResult<HomePageDto> GetHome() => Ok(clubService.GetHomePage());

    [HttpGet("meta")]
    public ActionResult<object> GetMeta() => Ok(new
    {
        message = localizer["ApiWelcome"].Value,
        supportedCultures = new[] { "ru", "en" },
        version = "1.0"
    });
}
