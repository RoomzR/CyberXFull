using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CyberX.WebApi.Auth;

/// <summary>
/// Accepts requests that have a valid JWT token with one of the specified roles,
/// OR fall back to the legacy X-Admin-Key header for backward compatibility.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class AuthorizeRoleAttribute : Attribute, IAuthorizationFilter
{
    private readonly string[] _roles;

    public AuthorizeRoleAttribute(params string[] roles) => _roles = roles;

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;

        // ── Path 1: JWT bearer ──────────────────────────────────────────
        if (user.Identity?.IsAuthenticated == true)
        {
            if (_roles.Length == 0 || _roles.Any(r => user.IsInRole(r)))
                return;

            context.Result = new ForbidResult();
            return;
        }

        // ── Path 2: Legacy X-Admin-Key (fallback for old admin panel) ───
        var cfg        = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
        var expectedKey = cfg["Admin:ApiKey"];

        if (!string.IsNullOrWhiteSpace(expectedKey)
            && context.HttpContext.Request.Headers.TryGetValue("X-Admin-Key", out var provided)
            && provided == expectedKey)
        {
            return;
        }

        context.Result = new UnauthorizedResult();
    }
}
