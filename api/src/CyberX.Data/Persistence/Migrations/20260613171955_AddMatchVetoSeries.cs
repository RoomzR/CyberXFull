using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CyberX.Data.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMatchVetoSeries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MatchSeries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ServerId = table.Column<int>(type: "int", nullable: true),
                    Team1Name = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Team2Name = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Format = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MatchSeries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MatchSeries_GameServers_ServerId",
                        column: x => x.ServerId,
                        principalTable: "GameServers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "MatchVetoActions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SeriesId = table.Column<int>(type: "int", nullable: false),
                    StepOrder = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    MapName = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Team = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    SideNote = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MatchVetoActions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MatchVetoActions_MatchSeries_SeriesId",
                        column: x => x.SeriesId,
                        principalTable: "MatchSeries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MatchSeries_ServerId",
                table: "MatchSeries",
                column: "ServerId");

            migrationBuilder.CreateIndex(
                name: "IX_MatchVetoActions_SeriesId",
                table: "MatchVetoActions",
                column: "SeriesId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MatchVetoActions");

            migrationBuilder.DropTable(
                name: "MatchSeries");
        }
    }
}
