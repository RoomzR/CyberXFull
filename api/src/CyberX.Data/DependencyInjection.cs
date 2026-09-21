using CyberX.Data.Persistence;
using CyberX.Data.Repositories;
using CyberX.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CyberX.Data;

public static class DependencyInjection
{
    public static IServiceCollection AddDataServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        services.AddDbContext<CyberXDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddScoped<IClubRepository, EfClubRepository>();
        services.AddScoped<ITournamentRepository, EfTournamentRepository>();

        return services;
    }
}
