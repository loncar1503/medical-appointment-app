using MedicalAppointment.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Domain.IRepositories
{
    public interface IAppointmentRepository
    {
        Task<Appointment> GetByIdAsync(Guid id);
        Task<Appointment> AddAsync(Appointment appointment);

        Task<Appointment> UpdateAsync(Appointment appointment);

        Task<bool> DeleteAsync(Guid id);

        Task<List<Appointment>> GetAllAsync();

        Task<List<Appointment>> GetAllFilteredAsync(
        Guid? doctorId,
        Guid? patientId,
        AppointmentType? type,
        AppointmentStatus? status,
        DateTime? startFrom,
        DateTime? startTo,
        string? notesContains,
        string? sortBy,
        bool sortDesc
        );

        Task<bool> HasOverlapAsync(
            Guid doctorId,
            Guid patientId,
            DateTime startTime,
            DateTime endTime,
            Guid? excludeAppointmentId = null);
    }
}
