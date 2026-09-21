using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CyberX.Data.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RenameVkUrlToInstagramUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "VkUrl",
                table: "Clubs",
                newName: "InstagramUrl");

            migrationBuilder.Sql(
                """
                UPDATE [Clubs]
                SET [InstagramUrl] = N'https://www.instagram.com/cyberx_gomel'
                WHERE [InstagramUrl] IS NULL
                   OR [InstagramUrl] NOT LIKE N'%instagram%';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "InstagramUrl",
                table: "Clubs",
                newName: "VkUrl");
        }
    }
}
