using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DragoDeskHelp.Core.DTOs;
using DragoDeskHelp.Core.Interfaces;

namespace DragoDeskHelp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        private string? GetUserId() =>
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        [HttpGet]
        public async Task<ActionResult<PagedResponse<NotificationResponseDto>>> GetNotifications(
            [FromQuery] bool unreadOnly = false,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var response = await _notificationService.GetNotificationsAsync(
                userId, unreadOnly, pageNumber, pageSize);

            return Ok(response);
        }

        [HttpGet("unread-count")]
        public async Task<ActionResult<UnreadCountResponseDto>> GetUnreadCount()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var count = await _notificationService.GetUnreadCountAsync(userId);

            return Ok(new UnreadCountResponseDto { Count = count });
        }

        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var success = await _notificationService.MarkAsReadAsync(id, userId);

            if (!success)
                return NotFound(new { Message = "Сповіщення не знайдено." });

            return Ok(new { Message = "Сповіщення позначено як прочитане." });
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteReadNotifications()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            await _notificationService.DeleteReadNotificationsAsync(userId);

            return NoContent();
        }
    }
}
