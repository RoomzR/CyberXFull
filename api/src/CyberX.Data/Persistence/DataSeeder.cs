using System.Text.Json;
using CyberX.Data.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace CyberX.Data.Persistence;

public static class DataSeeder
{
    public static async Task SeedAsync(CyberXDbContext db)
    {
        // Apply all pending migrations (creates tables if needed)
        await db.Database.MigrateAsync();

        // ── Seed default users ────────────────────────────────────────────
        await SeedUsersAsync(db);

        // ── Seed PCs ──────────────────────────────────────────────────────
        await SeedPcsAsync(db);

        // ── Seed game servers ─────────────────────────────────────────────
        await SeedGameServersAsync(db);
        await SeedDemoVetoAsync(db);

        // ── Seed club content (only once) ─────────────────────────────────
        if (await db.Clubs.AnyAsync())
            return;

        db.Clubs.Add(new ClubRecord
        {
            NameRu = "CyberX Гомель",
            NameEn = "CyberX Gomel",
            TaglineRu = "Ультрасовременное киберспортивное пространство",
            TaglineEn = "Ultra-modern esports arena",
            AboutRu = "CyberX Community — ультрасовременное киберспортивное пространство для тех, кто любит проводить время с удовольствием и полным погружением в атмосферу. Мы проводим регулярные киберспортивные мероприятия, где можно заработать, повысить свой скилл, а также найти свою тусовку.",
            AboutEn = "CyberX Community is an ultra-modern esports space for those who love immersive gaming experiences. We host regular esports events where you can compete, level up your skills, and find your crew.",
            Phone = "+375296026202",
            Address = "ул. Интернациональная 13",
            City = "Гомель",
            Country = "Беларусь",
            InstagramUrl = "https://www.instagram.com/cyberx_gomel",
            TelegramUrl = "https://t.me/cyberxgomel",
            SupportedGamesJson = JsonSerializer.Serialize(new[] { "CS2", "League of Legends", "Fortnite", "Valorant", "Dota 2" })
        });

        db.Tournaments.AddRange(
            new TournamentRecord
            {
                TitleRu = "CyberX League S4", TitleEn = "CyberX League S4",
                DescriptionRu = "Флагманский сезон CyberX League с призовым фондом и открытой регистрацией для команд региона.",
                DescriptionEn = "Flagship CyberX League season with prize pool and open registration for regional teams.",
                Game = "CS2", Status = "registration",
                StartDate = new DateTime(2026, 6, 15), EndDate = new DateTime(2026, 7, 20),
                PrizePool = 2500, RegistrationUrl = "https://vk.cc/cG6xst", RulesUrl = "https://vk.cc/cG6xnW",
                IsFeatured = true
            },
            new TournamentRecord
            {
                TitleRu = "Valorant Open Cup", TitleEn = "Valorant Open Cup",
                DescriptionRu = "Открытый кубок по Valorant для любителей и полупро-команд Гомеля.",
                DescriptionEn = "Open Valorant cup for amateur and semi-pro teams from Gomel.",
                Game = "Valorant", Status = "upcoming",
                StartDate = new DateTime(2026, 7, 5), PrizePool = 800,
                RegistrationUrl = "https://vk.cc/cG6xst", RulesUrl = "https://vk.cc/cG6xkw",
                IsFeatured = true
            },
            new TournamentRecord
            {
                TitleRu = "LoL Friday Night", TitleEn = "LoL Friday Night",
                DescriptionRu = "Еженедельные матчи League of Legends в формате 5v5 с рейтинговой системой.",
                DescriptionEn = "Weekly League of Legends 5v5 matches with a rating system.",
                Game = "League of Legends", Status = "ongoing",
                StartDate = new DateTime(2026, 5, 1), PrizePool = 400,
                RegistrationUrl = "https://vk.cc/cG6xst", RulesUrl = "https://vk.cc/chIaLQ",
                IsFeatured = true
            },
            new TournamentRecord
            {
                TitleRu = "Fortnite Solo Showdown", TitleEn = "Fortnite Solo Showdown",
                DescriptionRu = "Соло-турнир Fortnite с быстрыми раундами и стримом на площадке клуба.",
                DescriptionEn = "Fortnite solo tournament with fast rounds and on-site streaming.",
                Game = "Fortnite", Status = "finished",
                StartDate = new DateTime(2026, 4, 12), EndDate = new DateTime(2026, 4, 12),
                PrizePool = 300, RegistrationUrl = "https://vk.cc/cG6xst", RulesUrl = "https://vk.cc/chQjt6",
                IsFeatured = false
            });

        db.Teams.AddRange(
            new TeamRecord { Name = "Nexus Prime", Tag = "NXP", Rating = 2450, Wins = 18, Losses = 4, PrimaryGame = "CS2", LogoColor = "#00f0ff" },
            new TeamRecord { Name = "Gomel Wolves", Tag = "GW", Rating = 2180, Wins = 15, Losses = 7, PrimaryGame = "CS2", LogoColor = "#a855f7" },
            new TeamRecord { Name = "Cyber Saints", Tag = "CS", Rating = 1950, Wins = 12, Losses = 8, PrimaryGame = "Valorant", LogoColor = "#22d3ee" },
            new TeamRecord { Name = "Neon Rush", Tag = "NR", Rating = 1820, Wins = 11, Losses = 9, PrimaryGame = "Valorant", LogoColor = "#f472b6" },
            new TeamRecord { Name = "LoL Syndicate", Tag = "LS", Rating = 1760, Wins = 14, Losses = 6, PrimaryGame = "LoL", LogoColor = "#fbbf24" },
            new TeamRecord { Name = "Storm Breakers", Tag = "SB", Rating = 1650, Wins = 10, Losses = 10, PrimaryGame = "CS2", LogoColor = "#34d399" },
            new TeamRecord { Name = "Pixel Raiders", Tag = "PR", Rating = 1540, Wins = 9, Losses = 11, PrimaryGame = "Fortnite", LogoColor = "#fb7185" },
            new TeamRecord { Name = "Dark Matter", Tag = "DM", Rating = 1420, Wins = 8, Losses = 12, PrimaryGame = "Dota 2", LogoColor = "#818cf8" },
            new TeamRecord { Name = "Voltage", Tag = "VTG", Rating = 1380, Wins = 7, Losses = 13, PrimaryGame = "CS2", LogoColor = "#fde047" },
            new TeamRecord { Name = "Zero Hour", Tag = "ZH", Rating = 1290, Wins = 6, Losses = 14, PrimaryGame = "Valorant", LogoColor = "#94a3b8" });

        db.Events.AddRange(
            new EventRecord { TitleRu = "CyberX League S4 — Старт сезона", TitleEn = "CyberX League S4 — Season Kickoff", DescriptionRu = "Открытие четвёртого сезона лиги с шоу-матчем и розыгрышем мерча.", DescriptionEn = "Fourth league season kickoff with show match and merch giveaway.", Type = "tournament", Date = new DateTime(2026, 6, 15), ImageGradient = "from-cyan-500 to-blue-600" },
            new EventRecord { TitleRu = "Bootcamp Weekend CS2", TitleEn = "CS2 Bootcamp Weekend", DescriptionRu = "Двухдневный тренировочный кэмп с разбором демо и спаррингами.", DescriptionEn = "Two-day training camp with demo reviews and scrims.", Type = "bootcamp", Date = new DateTime(2026, 5, 28), ImageGradient = "from-purple-500 to-pink-600" },
            new EventRecord { TitleRu = "Valorant Community Night", TitleEn = "Valorant Community Night", DescriptionRu = "Открытый вечер для соло-игроков — подбор команд и микс-матчи.", DescriptionEn = "Open evening for solo players — team matchmaking and mix games.", Type = "community", Date = new DateTime(2026, 5, 20), ImageGradient = "from-emerald-500 to-teal-600" },
            new EventRecord { TitleRu = "Стрим-турнир Fortnite", TitleEn = "Fortnite Stream Tournament", DescriptionRu = "Турнир с прямой трансляцией и комментированием на площадке.", DescriptionEn = "Tournament with live stream and on-site commentary.", Type = "tournament", Date = new DateTime(2026, 4, 12), ImageGradient = "from-orange-500 to-red-600" },
            new EventRecord { TitleRu = "LoL Draft Night", TitleEn = "LoL Draft Night", DescriptionRu = "Драфт-вечеринка с призами за лучший пик команд.", DescriptionEn = "Draft party with prizes for the best team compositions.", Type = "community", Date = new DateTime(2026, 4, 5), ImageGradient = "from-yellow-500 to-amber-600" },
            new EventRecord { TitleRu = "CyberX Open Day", TitleEn = "CyberX Open Day", DescriptionRu = "День открытых дверей — экскурсия, демо-зона и бесплатный час игры.", DescriptionEn = "Open house — tour, demo zone, and one free hour of play.", Type = "community", Date = new DateTime(2026, 3, 22), ImageGradient = "from-indigo-500 to-violet-600" });

        db.FaqItems.AddRange(
            new FaqRecord { Order = 1, QuestionRu = "Как связаться с CyberX Гомель?", QuestionEn = "How to contact CyberX Gomel?", AnswerRu = "Телефон: +375296026202. Адрес: Беларусь, Гомель, ул. Интернациональная 13. Также пишите в Instagram или Telegram.", AnswerEn = "Phone: +375296026202. Address: 13 Internatsionalnaya St., Gomel, Belarus. You can also reach us on Instagram or Telegram." },
            new FaqRecord { Order = 2, QuestionRu = "Какие игры проводятся на турнирах CyberX League?", QuestionEn = "Which games are featured in CyberX League tournaments?", AnswerRu = "CS2, League of Legends, Fortnite, Valorant и другие дисциплины по расписанию сезона.", AnswerEn = "CS2, League of Legends, Fortnite, Valorant, and other titles depending on the season schedule." },
            new FaqRecord { Order = 3, QuestionRu = "Как зарегистрироваться на турниры?", QuestionEn = "How do I register for tournaments?", AnswerRu = "Регистрация через Google-форму по ссылке: https://vk.cc/cG6xst", AnswerEn = "Register via the Google Form: https://vk.cc/cG6xst" },
            new FaqRecord { Order = 4, QuestionRu = "Где найти регламент турниров?", QuestionEn = "Where can I find tournament rules?", AnswerRu = "Регламенты доступны по ссылкам на странице каждого турнира и в Instagram клуба.", AnswerEn = "Rules are available via links on each tournament page and on the club's Instagram." },
            new FaqRecord { Order = 5, QuestionRu = "Можно ли прийти просто поиграть без турнира?", QuestionEn = "Can I just come to play without joining a tournament?", AnswerRu = "Да! CyberX — полноценный компьютерный клуб с топовым железом. Бронируйте место по телефону или в соцсетях.", AnswerEn = "Yes! CyberX is a full gaming club with top-tier hardware. Book a seat by phone or via social media." });

        await db.SaveChangesAsync();
    }

    private static async Task SeedUsersAsync(CyberXDbContext db)
    {
        var seeds = new[]
        {
            ("admin@cyberx.by",   "admin",   "Admin123!",   "Admin"),
            ("manager@cyberx.by", "manager", "Manager123!", "Manager"),
            ("player@cyberx.by",  "player",  "Player123!",  "Player"),
        };

        foreach (var (email, username, password, role) in seeds)
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user is null)
            {
                db.Users.Add(new UserRecord
                {
                    Email        = email,
                    Username     = username,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                    Role         = role,
                    CreatedAt    = DateTime.UtcNow,
                    IsActive     = true,
                    Balance      = 500m,
                });
            }
            else
            {
                // Always refresh the hash so seeded passwords are guaranteed correct
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
                user.IsActive     = true;
                if (user.Balance == 0) user.Balance = 500m;
            }
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedPcsAsync(CyberXDbContext db)
    {
        if (await db.Pcs.AnyAsync()) return;

        var stageSpecs   = "Intel i9-13900K / RTX 4090 / 32GB DDR5 / 4K 144Hz";
        var bootcampSpecs= "Intel i7-13700K / RTX 4070 Ti / 32GB DDR5 / 1440p 165Hz";
        var stdSpecs     = "Intel i5-13600K / RTX 4060 Ti / 16GB DDR5 / 1080p 240Hz";

        var zones = new[]
        {
            ("STAGE",    stageSpecs,    200m, 10),
            ("BOOTCAMP", bootcampSpecs, 150m, 10),
            ("STANDART", stdSpecs,      100m, 25),
        };

        int num = 1;
        foreach (var (zone, specs, rate, count) in zones)
        {
            for (int i = 0; i < count; i++, num++)
                db.Pcs.Add(new PcRecord { Number = num, Zone = zone, Specs = specs, HourlyRate = rate });
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedGameServersAsync(CyberXDbContext db)
    {
        if (await db.GameServers.AnyAsync()) return;

        var pc1 = await db.Pcs.FirstOrDefaultAsync(p => p.Number == 1);

        db.GameServers.Add(new GameServerRecord
        {
            Name       = "STAGE #1 — Demo",
            GsiToken   = "cyberx-demo-gsi-token-001",
            IpAddress  = "192.168.1.100",
            Port       = 27015,
            LinkedPcId = pc1?.Id,
            IsActive   = true,
            CreatedAt  = DateTime.UtcNow,
        });

        await db.SaveChangesAsync();
    }

    private static async Task SeedDemoVetoAsync(CyberXDbContext db)
    {
        var server = await db.GameServers.OrderBy(s => s.Id).FirstOrDefaultAsync();
        if (server is null) return;

        if (await db.MatchSeries.AnyAsync(s => s.ServerId == server.Id))
            return;

        var series = new MatchSeriesRecord
        {
            ServerId  = server.Id,
            Team1Name = "CyberX CT",
            Team2Name = "CyberX T",
            Format    = "bo1",
            Status    = "live",
        };
        db.MatchSeries.Add(series);
        await db.SaveChangesAsync();

        var steps = new (string action, string map, string team, string? note)[]
        {
            ("ban", "de_overpass", "team1", null),
            ("ban", "de_nuke", "team2", null),
            ("pick", "de_dust2", "team1", "CyberX T starts CT"),
            ("pick", "de_inferno", "team2", "CyberX CT starts CT"),
            ("ban", "de_ancient", "team1", null),
            ("ban", "de_mirage", "team2", null),
            ("decider", "de_anubis", "team1", "Knife round for sides"),
        };

        for (var i = 0; i < steps.Length; i++)
        {
            var (action, map, team, note) = steps[i];
            db.MatchVetoActions.Add(new MatchVetoActionRecord
            {
                SeriesId  = series.Id,
                StepOrder = i + 1,
                Action    = action,
                MapName   = map,
                Team      = team,
                SideNote  = note,
            });
        }

        await db.SaveChangesAsync();
    }
}
