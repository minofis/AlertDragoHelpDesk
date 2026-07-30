using Microsoft.AspNetCore.Mvc;
using DragoDeskHelp.Core.DTOs;
using DragoDeskHelp.Core.Interfaces;

namespace DragoDeskHelp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("google-login")]
        public async Task<ActionResult<AuthResponseDto>> GoogleLogin([FromBody] AuthRequestDto request)
        {
            try
            {
                var result = await _authService.LoginWithGoogleAsync(request);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { Message = ex.Message });
            }
        }
    }
}
