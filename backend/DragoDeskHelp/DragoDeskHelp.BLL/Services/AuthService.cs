using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DragoDeskHelp.Core.DTOs;
using DragoDeskHelp.Core.Entities;
using DragoDeskHelp.Core.Enums;
using DragoDeskHelp.Core.Interfaces;
using DragoDeskHelp.DAL;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DragoDeskHelp.BLL.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> LoginWithGoogleAsync(AuthRequestDto request)
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken);

            var email = payload.Email;
            var name = payload.Name;

            if (email.EndsWith("@std.udu.edu.ua"))
                throw new UnauthorizedAccessException("Student accounts (@std.udu.edu.ua) are not allowed.");

            if (!email.EndsWith("@udu.edu.ua") && !email.EndsWith("@npu.edu.ua"))
                throw new UnauthorizedAccessException("Only @udu.edu.ua and @npu.edu.ua email domains are allowed.");

            var adminEmail = _configuration["AdminEmail"] ?? string.Empty;
            var adminEmails = _configuration.GetSection("AllowedAdminEmails").Get<string[]>() ?? Array.Empty<string>();
            var isAdmin = (!string.IsNullOrEmpty(adminEmail) && email.Equals(adminEmail, StringComparison.OrdinalIgnoreCase))
                          || adminEmails.Any(a => email.Equals(a, StringComparison.OrdinalIgnoreCase));
            var role = isAdmin ? UserRole.Admin : UserRole.Teacher;

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user != null)
            {
                user.Name = name;
                user.Role = role;
            }
            else
            {
                user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = email,
                    Name = name,
                    Role = role
                };
                _context.Users.Add(user);
            }

            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Token = token,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role.ToString()
            };
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["Secret"]!;
            var issuer = jwtSettings["Issuer"]!;
            var audience = jwtSettings["Audience"]!;
            var expirationDays = int.Parse(jwtSettings["ExpirationDays"]!);

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("role", user.Role.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(expirationDays),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
