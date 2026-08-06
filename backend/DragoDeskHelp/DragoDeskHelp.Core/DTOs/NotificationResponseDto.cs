namespace DragoDeskHelp.Core.DTOs
{
    public class NotificationResponseDto
    {
        public Guid Id { get; set; }

        public string UserId { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; }

        public int? RelatedTicketId { get; set; }

        public string CreatedAt { get; set; } = string.Empty;
    }
}
