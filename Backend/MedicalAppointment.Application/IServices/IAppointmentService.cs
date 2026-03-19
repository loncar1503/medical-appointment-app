using MedicalAppointment.Application.DTOs.Appointment;
using MedicalAppointment.Application.DTOs.Doctor;
using MedicalAppointment.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Application.IServices
{
    public interface IAppointmentService
    {
        Task<Appointment> GetByIdAsync(Guid guid);
        Task<Appointment> CreateAsync(CreateAppointmentDTO createAppointmentDTO);

        Task<Appointment> UpdateAsync(Guid Id, UpdateAppointmentDTO updateAppointmentDTO);

        Task<bool> DeleteAsync(Guid id);

        Task<List<ReturnAppointmentDTO>> GetAllAsync();
        Task<byte[]> GetAllAppointmentsCsvAsync();

        Task<(Doctor doctor, DateTime start, DateTime end)> ScheduleFromIntentAsync(
            Patient patient,
            Specialization specialization,
            AppointmentType type);
        Task<List<ReturnAppointmentDTO>> GetAllFilteredAsync(
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
        Task<BulkInsertAppointmentsResponse> BulkInsertAsync(List<CreateAppointmentBulkDTO> appointments);
    }
}
