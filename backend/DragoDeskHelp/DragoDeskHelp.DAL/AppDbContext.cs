using DragoDeskHelp.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace DragoDeskHelp.DAL
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Ticket> Tickets { get; set; }

        public DbSet<User> Users { get; set; }

        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);

                entity.HasMany(u => u.Tickets)
                      .WithOne(t => t.Author)
                      .HasForeignKey(t => t.AuthorId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
