using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DragoDeskHelp.Core.DTOs;
using DragoDeskHelp.Core.Interfaces;
using DragoDeskHelp.Core.Enums;

namespace DragoDeskHelp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _ticketService;

        public TicketsController(ITicketService ticketService)
        {
            _ticketService = ticketService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PagedResponse<TicketResponseDto>>> GetTickets(
            [FromQuery] TicketStatus? status, 
            [FromQuery] string? assigneeId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var response = await _ticketService.GetTicketsAsync(status, assigneeId, pageNumber, pageSize);
            return Ok(response);
        }

        [HttpGet("my")]
        public async Task<ActionResult<PagedResponse<TicketResponseDto>>> GetMyTickets(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var response = await _ticketService.GetTicketsByAuthorAsync(userId, pageNumber, pageSize);
            return Ok(response);
        }

        [HttpPost]
        public async Task<ActionResult> CreateTicket(TicketRequestDto ticketDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var authorId))
                return Unauthorized();

            var newTicketId = await _ticketService.CreateTicketAsync(ticketDto, authorId);
            
            return Ok(new { Message = "Заявка створена", Id = newTicketId });
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTicketStatus(int id, [FromBody] TicketStatusUpdateDto dto)
        {
            var isUpdated = await _ticketService.UpdateTicketStatusAsync(id, dto.Status, dto.AssigneeId);

            if (!isUpdated)
            {
                return NotFound(new { Message = $"Заявка з ID {id} не знайдена." });
            }

            return Ok(new { Message = "Статус успішно оновлено!" });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TicketResponseDto>> GetTicket(int id)
        {
            var ticket = await _ticketService.GetTicketByIdAsync(id);
            
            if (ticket == null)
                return NotFound(new { Message = $"Заявка з ID {id} не знайдена." });

            return Ok(ticket);
        }
    }
}