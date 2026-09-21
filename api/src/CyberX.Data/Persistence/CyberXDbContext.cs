using CyberX.Data.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace CyberX.Data.Persistence;

public sealed class CyberXDbContext(DbContextOptions<CyberXDbContext> options) : DbContext(options)
{
    public DbSet<ClubRecord>         Clubs         => Set<ClubRecord>();
    public DbSet<TournamentRecord>   Tournaments   => Set<TournamentRecord>();
    public DbSet<TeamRecord>         Teams         => Set<TeamRecord>();
    public DbSet<EventRecord>        Events        => Set<EventRecord>();
    public DbSet<FaqRecord>          FaqItems      => Set<FaqRecord>();
    public DbSet<UserRecord>         Users         => Set<UserRecord>();
    public DbSet<RefreshTokenRecord> RefreshTokens => Set<RefreshTokenRecord>();
    public DbSet<PcRecord>           Pcs           => Set<PcRecord>();
    public DbSet<BookingRecord>      Bookings      => Set<BookingRecord>();
    public DbSet<GameServerRecord>   GameServers   => Set<GameServerRecord>();
    public DbSet<MatchRecord>        Matches       => Set<MatchRecord>();
    public DbSet<MatchPlayerStatRecord> MatchPlayerStats => Set<MatchPlayerStatRecord>();
    public DbSet<MatchSeriesRecord>     MatchSeries      => Set<MatchSeriesRecord>();
    public DbSet<MatchVetoActionRecord> MatchVetoActions => Set<MatchVetoActionRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ClubRecord>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.SupportedGamesJson).HasColumnType("nvarchar(max)");
        });

        modelBuilder.Entity<TournamentRecord>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.PrizePool).HasPrecision(18, 0);
        });

        modelBuilder.Entity<TeamRecord>().HasKey(x => x.Id);
        modelBuilder.Entity<EventRecord>().HasKey(x => x.Id);
        modelBuilder.Entity<FaqRecord>().HasKey(x => x.Id);

        modelBuilder.Entity<UserRecord>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Email).HasMaxLength(256);
            e.Property(x => x.Username).HasMaxLength(50);
            e.Property(x => x.Role).HasMaxLength(20);
            e.HasIndex(x => x.Email).IsUnique();
        });

        modelBuilder.Entity<RefreshTokenRecord>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Token).HasMaxLength(512);
            e.HasOne(x => x.User)
             .WithMany(u => u.RefreshTokens)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserRecord>(e =>
        {
            e.Property(x => x.Balance).HasColumnType("decimal(10,2)");
        });

        modelBuilder.Entity<PcRecord>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Zone).HasMaxLength(20);
            e.Property(x => x.Status).HasMaxLength(20);
            e.Property(x => x.HourlyRate).HasColumnType("decimal(10,2)");
        });

        modelBuilder.Entity<BookingRecord>(e =>
        {
            e.HasKey(x => x.Id);
            e.Ignore(x => x.EndTime);
            e.Property(x => x.Status).HasMaxLength(20);
            e.Property(x => x.TotalPrice).HasColumnType("decimal(10,2)");
            e.HasOne(x => x.User)
             .WithMany(u => u.Bookings)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Pc)
             .WithMany(p => p.Bookings)
             .HasForeignKey(x => x.PcId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<GameServerRecord>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(100);
            e.Property(x => x.GsiToken).HasMaxLength(64);
            e.HasIndex(x => x.GsiToken).IsUnique();
            e.HasOne(x => x.Pc)
             .WithMany()
             .HasForeignKey(x => x.LinkedPcId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<MatchRecord>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.MapName).HasMaxLength(64);
            e.Property(x => x.Status).HasMaxLength(20);
            e.HasOne(x => x.Server)
             .WithMany(s => s.Matches)
             .HasForeignKey(x => x.ServerId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MatchPlayerStatRecord>(e =>
        {
            e.HasKey(x => x.Id);
            e.Ignore(x => x.Kd);
            e.Ignore(x => x.HsPct);
            e.Property(x => x.SteamId).HasMaxLength(32);
            e.Property(x => x.PlayerName).HasMaxLength(64);
            e.Property(x => x.Team).HasMaxLength(4);
            e.HasOne(x => x.Match)
             .WithMany(m => m.PlayerStats)
             .HasForeignKey(x => x.MatchId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MatchSeriesRecord>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Team1Name).HasMaxLength(64);
            e.Property(x => x.Team2Name).HasMaxLength(64);
            e.Property(x => x.Format).HasMaxLength(10);
            e.Property(x => x.Status).HasMaxLength(20);
            e.HasOne(x => x.Server)
             .WithMany()
             .HasForeignKey(x => x.ServerId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<MatchVetoActionRecord>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Action).HasMaxLength(10);
            e.Property(x => x.MapName).HasMaxLength(64);
            e.Property(x => x.Team).HasMaxLength(10);
            e.Property(x => x.SideNote).HasMaxLength(128);
            e.HasOne(x => x.Series)
             .WithMany(s => s.VetoActions)
             .HasForeignKey(x => x.SeriesId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
