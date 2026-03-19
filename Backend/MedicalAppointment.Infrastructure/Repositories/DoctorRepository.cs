using MedicalAppointment.Domain.Entities;
using MedicalAppointment.Domain.IRepositories;
using MedicalAppointment.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Infrastructure.Repositories
{
    public class DoctorRepository:IDoctorRepository
    {
        private readonly AppDbContext _context;

        public DoctorRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Doctor?> GetByIdAsync(Guid id)
        {
            return await _context.Doctors
                .FirstOrDefaultAsync(p => p.Id == id);
        }
        public async Task AddAsync(Doctor doctor)
        {
            await _context.Doctors.AddAsync(doctor);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Doctor>> GetAllAsync()
        {
            return await _context.Doctors.ToListAsync();
        }
        public async Task UpdateAsync(Doctor doctor)
        {
            _context.Doctors.Update(doctor);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Doctor doctor)
        {
            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();
        }
        public async Task<List<Doctor>> GetByEmailsAsync(IEnumerable<string> emails)
        {
            var normalized = emails
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(NormalizeEmail)
                .Distinct()
                .ToList();

            if (normalized.Count == 0) return new List<Doctor>();

            return await _context.Doctors
                .Where(d => d.Email != null && normalized.Contains(d.Email.ToLower()))
                .ToListAsync();
        }
        private static string NormalizeEmail(string email)
        => email.Trim().ToLowerInvariant();
    }
}
