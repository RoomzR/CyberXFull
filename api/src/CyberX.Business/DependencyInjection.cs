using CyberX.Business.Services;
using Microsoft.Extensions.DependencyInjection;

namespace CyberX.Business;

public static class DependencyInjection
{
    public static IServiceCollection AddBusinessServices(this IServiceCollection services)
    {
        services.AddScoped<IClubService, ClubService>();
        services.AddScoped<ITournamentAdminService, TournamentAdminService>();
        return services;
    }
}
