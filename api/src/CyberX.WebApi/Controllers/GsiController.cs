using System.Text.Json;
using CyberX.WebApi.Services.Gsi;
using Microsoft.AspNetCore.Mvc;

namespace CyberX.WebApi.Controllers;

/// <summary>
/// CS2 Game State Integration endpoint.
/// Configure in game: gamestate_integration_cyberx.cfg
/// </summary>
[ApiController]
[Route("api/gsi")]
public sealed class GsiController(GsiStore store, ILogger<GsiController> log) : ControllerBase
{
    [HttpPost("{token}")]
    public async Task<IActionResult> Receive(string token)
    {
        JsonDocument doc;
        try
        {
            doc = await JsonDocument.ParseAsync(Request.Body);
        }
        catch (JsonException ex)
        {
            log.LogWarning(ex, "Invalid GSI JSON");
            return BadRequest("Invalid JSON");
        }

        using (doc)
        {
            await store.ProcessAsync(token, doc.RootElement);
        }

        log.LogInformation("GSI received token={TokenPrefix}… bytes={Bytes}",
            token[..Math.Min(8, token.Length)],
            Request.ContentLength ?? 0);

        return Ok();
    }
}
