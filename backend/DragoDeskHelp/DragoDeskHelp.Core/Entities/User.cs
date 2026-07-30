using DragoDeskHelp.Core.Enums;

namespace DragoDeskHelp.Core.Entities
{
    public class User
    {
        public Guid Id { get; set; }

        public string Email { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public UserRole Role { get; set; } = UserRole.Teacher;

        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}
