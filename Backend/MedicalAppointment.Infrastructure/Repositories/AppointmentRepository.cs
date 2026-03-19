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
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly AppDbContext _context;
        public AppointmentRepository(AppDbContext dbContext)
        {
            _context = dbContext;
        }
        public async Task<Appointment> AddAsync(Appointment appointment)
        {

            await _context.Appointments.AddAsync(appointment);
            await _context.SaveChangesAsync();
            return appointment;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var entity = await _context.Appointments.FirstOrDefaultAsync(x => x.Id == id);
            if (entity is null) return false;

            _context.Appointments.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Appointment?> GetByIdAsync(Guid id)
        {
            return await _context.Appointments
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<Appointment> UpdateAsync(Appointment appointment)
        {
            _context.Appointments.Update(appointment);
            await _context.SaveChangesAsync();
            return appointment;
        }

        public async Task<List<Appointment>> GetAllAsync()
        {
            return await _context.Appointments
                .AsNoTracking()
                .Include(a => a.Doctor)
                .Include(a => a.Patient)
                .OrderByDescending(a => a.StartTime)
                .ToListAsync();
        }
        public async Task<List<Appointment>> GetAllFilteredAsync(
                Guid? doctorId,
                Guid? patientId,
                AppointmentType? type,
                AppointmentStatus? status,
                DateTime? startFrom,
                DateTime? startTo,
                string? notesContains,
                string? sortBy,
                bool sortDesc)
        {
            // UZMI SVE preko postojeće metode (sa Include-ovima)
            var list = await GetAllAsync();

            // filteri
            if (doctorId.HasValue && doctorId.Value != Guid.Empty)
                list = list.Where(a => a.DoctorId == doctorId.Value).ToList();

            if (patientId.HasValue && patientId.Value != Guid.Empty)
                list = list.Where(a => a.PatientId == patientId.Value).ToList();

            if (type.HasValue)
                list = list.Where(a => a.Type == type.Value).ToList();

            if (status.HasValue)
                list = list.Where(a => a.Status == status.Value).ToList();

            if (startFrom.HasValue)
                list = list.Where(a => a.StartTime >= startFrom.Value).ToList();

            if (startTo.HasValue)
                list = list.Where(a => a.StartTime <= startTo.Value).ToList();

            if (!string.IsNullOrWhiteSpace(notesContains))
            {
                var s = notesContains.Trim();
                list = list.Where(a => (a.Notes ?? "").Contains(s)).ToList();
            }

            // sort (default StartTime)
            sortBy = string.IsNullOrWhiteSpace(sortBy)
    ? "starttime"
    : sortBy.Trim().ToLowerInvariant();

            list = sortBy switch
            {
                "endtime" => (sortDesc
                    ? list.OrderByDescending(a => a.EndTime)
                    : list.OrderBy(a => a.EndTime)).ToList(),

                "status" => (sortDesc
                    ? list.OrderByDescending(a => a.Status)
                    : list.OrderBy(a => a.Status)).ToList(),

                "type" => (sortDesc
                    ? list.OrderByDescending(a => a.Type)
                    : list.OrderBy(a => a.Type)).ToList(),

                // DEFAULT: StartTime DESC (najnoviji StartTime na vrhu)
                "starttime" => (sortDesc
                    ? list.OrderByDescending(a => a.StartTime)
                    : list.OrderBy(a => a.StartTime)).ToList(),

                // fallback ako proslediš neku glupost
                _ => list.OrderByDescending(a => a.StartTime).ToList(),
            };


            return list;
        }


        public async Task<bool> HasOverlapAsync(
    Guid doctorId,
    Guid patientId,
    DateTime startTime,
    DateTime endTime,
    Guid? excludeAppointmentId = null)
        {
            return await _context.Appointments.AnyAsync(a =>
                (excludeAppointmentId == null || a.Id != excludeAppointmentId.Value)
                && a.Status != AppointmentStatus.Canceled
                && (
                    // Doctor conflict
                    (a.DoctorId == doctorId &&
                     startTime < a.EndTime &&
                     endTime > a.StartTime)

                    ||

                    // Patient conflict
                    (a.PatientId == patientId &&
                     startTime < a.EndTime &&
                     endTime > a.StartTime)
                )
            );
        }

    }
}
