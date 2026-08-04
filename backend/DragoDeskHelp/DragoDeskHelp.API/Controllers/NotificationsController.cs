using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DragoDeskHelp.Core.DTOs;
using DragoDeskHelp.DAL;

namespace DragoDeskHelp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificationsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotificationResponseDto>>> GetNotifications([FromQuery] bool unreadOnly = false)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var kyivTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Kyiv");

            var query = _context.Notifications
                .Where(n => n.UserId == userIdClaim);

            if (unreadOnly)
            {
                query = query.Where(n => !n.IsRead);
            }

            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            var result = notifications.Select(n => new NotificationResponseDto
            {
                Id = n.Id,
                UserId = n.UserId,
                Message = n.Message,
                IsRead = n.IsRead,
                CreatedAt = TimeZoneInfo.ConvertTimeFromUtc(n.CreatedAt, kyivTimeZone).ToString("dd.MM.yyyy HH:mm")
            });

            return Ok(result);
        }

        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized();

            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
                return NotFound(new { Message = "Сповіщення не знайдено." });

            if (notification.UserId != userIdClaim)
                return Forbid();

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Сповіщення позначено як прочитане." });
        }
    }
}
