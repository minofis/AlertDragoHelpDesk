using DragoDeskHelp.Core.DTOs;

namespace DragoDeskHelp.Core.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginWithGoogleAsync(AuthRequestDto request);
    }
}
