using Microsoft.EntityFrameworkCore;
using DragoDeskHelp.DAL;
using DragoDeskHelp.Core.Enums;
using DragoDeskHelp.Core.Entities;
using DragoDeskHelp.Core.DTOs;
using DragoDeskHelp.Core.Interfaces;

namespace DragoDeskHelp.BLL.Services
{
    public class TicketService : ITicketService
    {
        private readonly AppDbContext _context;
        private readonly ITelegramBotService _telegramBotService;

        public TicketService(AppDbContext context, ITelegramBotService telegramBotService)
        {
            _context = context;
            _telegramBotService = telegramBotService;
        }

        public async Task<PagedResponse<TicketResponseDto>> GetTicketsAsync(TicketStatus? status = null, string? assigneeId = null, int pageNumber = 1, int pageSize = 10)
        {
            var query = _context.Tickets.Include(t => t.Author).AsQueryable();

            if (status.HasValue)
            {
                query = query.Where(t => t.Status == status.Value);
            }

            if (!string.IsNullOrEmpty(assigneeId))
            {
                query = query.Where(t => t.AssigneeTelegramId == assigneeId);
            }

            var totalCount = await query.CountAsync();

            var rawTickets = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var kyivTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Kyiv");

            var items = rawTickets.Select(t => {
                var localTime = TimeZoneInfo.ConvertTimeFromUtc(t.CreatedAt, kyivTimeZone);
                return new TicketResponseDto
                {
                    Id = t.Id,
                    RoomNumber = t.RoomNumber,
                    AuthorName = t.Author.Name,
                    Description = t.Description,
                    StatusText = t.Status switch 
                    {
                        TicketStatus.New => "Нова",
                        TicketStatus.InProgress => "В роботі",
                        TicketStatus.Resolved => "Виконано",
                        TicketStatus.Rejected => "Відхилено",
                        _ => "Невідомо"
                    },
                    CreatedAt = localTime.ToString("dd.MM.yyyy HH:mm"),
                    AssigneeId = t.AssigneeTelegramId 
                };
            });

            return new PagedResponse<TicketResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<string> CreateTicketAsync(TicketRequestDto ticketDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync();
            if (user == null)
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = "default@drago.local",
                    Name = ticketDto.AuthorName,
                    Role = UserRole.Teacher
                };
                _context.Users.Add(user);
            }

            var ticket = new Ticket
            {
                RoomNumber = ticketDto.RoomNumber,
                Description = ticketDto.Description,
                CreatedAt = DateTime.UtcNow,
                Status = TicketStatus.New,
                AuthorId = user.Id
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            string displayId = ticket.Id.ToString();

            await _telegramBotService.NotifyNewTicketAsync(
                displayId, 
                ticket.RoomNumber, 
                user.Name, 
                ticket.Description);

            return displayId;
        }

        public async Task<bool> UpdateTicketStatusAsync(int id, TicketStatus newStatus, string? assigneeId = null)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return false;

            if (ticket.Status == TicketStatus.New && newStatus == TicketStatus.InProgress)
            {
                if (!string.IsNullOrEmpty(ticket.AssigneeTelegramId) && ticket.AssigneeTelegramId != assigneeId)
                {
                    return false; 
                }
            }

            ticket.Status = newStatus;
            
            if (!string.IsNullOrEmpty(assigneeId))
            {
                ticket.AssigneeTelegramId = assigneeId;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<TicketResponseDto?> GetTicketByIdAsync(int id)
        {
            var ticket = await _context.Tickets
                .Include(t => t.Author)
                .FirstOrDefaultAsync(t => t.Id == id);
                
            if (ticket == null) return null;

            var kyivTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Kyiv");
            var localTime = TimeZoneInfo.ConvertTimeFromUtc(ticket.CreatedAt, kyivTimeZone);

            return new TicketResponseDto
            {
                Id = ticket.Id,
                RoomNumber = ticket.RoomNumber,
                AuthorName = ticket.Author.Name,
                Description = ticket.Description,
                StatusText = ticket.Status switch 
                {
                    TicketStatus.New => "Нова",
                    TicketStatus.InProgress => "В роботі",
                    TicketStatus.Resolved => "Виконано",
                    TicketStatus.Rejected => "Відхилено",
                    _ => "Невідомо"
                },
                CreatedAt = localTime.ToString("dd.MM.yyyy HH:mm"),
                AssigneeId = ticket.AssigneeTelegramId
            };
        }
    }
}
