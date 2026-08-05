using DragoDeskHelp.Core.DTOs;

namespace DragoDeskHelp.Core.Interfaces
{
    public interface INotificationService
    {
        Task<int> GetUnreadCountAsync(string userId);

        Task<PagedResponse<NotificationResponseDto>> GetNotificationsAsync(
            string userId, bool unreadOnly, int pageNumber, int pageSize);

        Task<bool> MarkAsReadAsync(Guid notificationId, string userId);

        Task DeleteReadNotificationsAsync(string userId);
    }
}
