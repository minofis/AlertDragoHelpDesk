using DragoDeskHelp.Core.DTOs;
using DragoDeskHelp.Core.Enums;

namespace DragoDeskHelp.Core.Interfaces
{
    public interface ITicketService
    {
        Task<PagedResponse<TicketResponseDto>> GetTicketsAsync(TicketStatus? status = null, string? assigneeId = null, int pageNumber = 1, int pageSize = 10);

        Task<TicketResponseDto?> GetTicketByIdAsync(int id);

        Task<string> CreateTicketAsync(TicketRequestDto ticketDto);
        
        Task<bool> UpdateTicketStatusAsync(int id, TicketStatus newStatus, string? assigneeId = null);
    }
}