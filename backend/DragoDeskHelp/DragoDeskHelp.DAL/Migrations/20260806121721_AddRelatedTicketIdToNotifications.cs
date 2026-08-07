using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DragoDeskHelp.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddRelatedTicketIdToNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RelatedTicketId",
                table: "Notifications",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RelatedTicketId",
                table: "Notifications");
        }
    }
}
