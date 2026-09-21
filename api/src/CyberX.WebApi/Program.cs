using System.Globalization;

using System.Text;

using CyberX.Business;

using CyberX.Data;

using CyberX.Data.Persistence;

using CyberX.WebApi.Services;

using Microsoft.AspNetCore.Authentication.JwtBearer;

using Microsoft.AspNetCore.Localization;

using Microsoft.Extensions.Options;

using Microsoft.IdentityModel.Tokens;



var builder = WebApplication.CreateBuilder(args);



// ── Localization ──────────────────────────────────────────────────────────────

builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");



// ── Core ──────────────────────────────────────────────────────────────────────

builder.Services.AddControllers();

builder.Services.AddBusinessServices();

builder.Services.AddDataServices(builder.Configuration);



// ── JWT Auth ──────────────────────────────────────────────────────────────────

var jwtSection = builder.Configuration.GetSection("Jwt");

var secretKey   = jwtSection["SecretKey"]

    ?? throw new InvalidOperationException("Jwt:SecretKey is not configured.");



builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)

    .AddJwtBearer(options =>

    {

        options.TokenValidationParameters = new TokenValidationParameters

        {

            ValidateIssuerSigningKey = true,

            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),

            ValidateIssuer           = true,

            ValidIssuer              = jwtSection["Issuer"],

            ValidateAudience         = true,

            ValidAudience            = jwtSection["Audience"],

            ValidateLifetime         = true,

            ClockSkew                = TimeSpan.Zero,

        };

    });



builder.Services.AddAuthorization();



// ── App services ──────────────────────────────────────────────────────────────

builder.Services.AddScoped<IJwtService, JwtService>();

builder.Services.AddScoped<IPasswordService, PasswordService>();

builder.Services.AddSingleton<CyberX.WebApi.Services.Gsi.GsiStore>();



// ── Request culture ───────────────────────────────────────────────────────────

builder.Services.Configure<RequestLocalizationOptions>(options =>

{

    var supportedCultures = new[]

    {

        new CultureInfo("ru"),

        new CultureInfo("en")

    };

    options.DefaultRequestCulture = new RequestCulture("ru");

    options.SupportedCultures     = supportedCultures;

    options.SupportedUICultures   = supportedCultures;

    options.RequestCultureProviders =

    [

        new QueryStringRequestCultureProvider(),

        new AcceptLanguageHeaderRequestCultureProvider()

    ];

});



// ── CORS ──────────────────────────────────────────────────────────────────────

builder.Services.AddCors(options =>

{

    options.AddPolicy("UiPolicy", policy =>

    {

        policy.WithOrigins(

                "http://localhost:5173",

                "http://localhost:5174",

                "http://localhost:3000",

                "http://127.0.0.1:5173",

                "http://127.0.0.1:5174")

            .AllowAnyHeader()

            .AllowAnyMethod();

    });

});



var app = builder.Build();



// ── Database seeding ──────────────────────────────────────────────────────────

using (var scope = app.Services.CreateScope())

{

    var db = scope.ServiceProvider.GetRequiredService<CyberXDbContext>();

    await DataSeeder.SeedAsync(db);

}



// ── Middleware pipeline ───────────────────────────────────────────────────────

var localizationOptions = app.Services.GetRequiredService<IOptions<RequestLocalizationOptions>>().Value;

app.UseRequestLocalization(localizationOptions);



app.UseCors("UiPolicy");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();



app.Run();

