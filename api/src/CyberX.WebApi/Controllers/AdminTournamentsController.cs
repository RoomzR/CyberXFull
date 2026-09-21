using CyberX.Business.DTOs;
using CyberX.Business.Services;
using CyberX.WebApi.Auth;
using Microsoft.AspNetCore.Mvc;

namespace CyberX.WebApi.Controllers;

[ApiController]
[Route("api/admin/tournaments")]
public sealed class AdminTournamentsController(ITournamentAdminService adminService) : ControllerBase
{
    [HttpGet]
    [AuthorizeRole("Admin", "Manager")]
    [ProducesResponseType<IReadOnlyList<TournamentAdminDto>>(StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<TournamentAdminDto>> GetAll() =>
        Ok(adminService.GetAll());

    [HttpGet("{id:int}")]
    [AuthorizeRole("Admin", "Manager")]
    [ProducesResponseType<TournamentAdminDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<TournamentAdminDto> GetById(int id)
    {
        var item = adminService.GetById(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    [AuthorizeRole("Admin", "Manager")]
    [ProducesResponseType<int>(StatusCodes.Status201Created)]
    public ActionResult<int> Create([FromBody] CreateTournamentRequest request)
    {
        var id = adminService.Create(request);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPut("{id:int}")]
    [AuthorizeRole("Admin", "Manager")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Update(int id, [FromBody] UpdateTournamentRequest request)
    {
        try
        {
            adminService.Update(id, request);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id:int}")]
    [AuthorizeRole("Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public IActionResult Delete(int id)
    {
        adminService.Delete(id);
        return NoContent();
    }
}
