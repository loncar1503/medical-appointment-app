using MedicalAppointment.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Domain.Entities
{
    public class Appointment
    {

        public Appointment() { }
    
        public Appointment(
            Guid patientId,
            Guid doctorId,
            AppointmentType type,
            DateTime startTime,
            DateTime endTime,
            string? notes)
        {
            if (patientId == Guid.Empty)
                throw new DomainValidationException("PatientId must be valid GUID");

            if (doctorId == Guid.Empty)
                throw new DomainValidationException("DoctorId must be valid GUID");

            if (startTime >= endTime)
                throw new DomainValidationException("Start time must be before end time");

            if (startTime < DateTime.UtcNow)
                throw new DomainValidationException("Appointment cannot be scheduled in the past");

            if (!string.IsNullOrWhiteSpace(notes) && notes.Length > 2000)
                throw new DomainValidationException("Notes cannot exceed 2000 characters");

            Id = Guid.NewGuid();
            PatientId = patientId;
            DoctorId = doctorId;
            Type = type;
            Status = AppointmentStatus.Scheduled;
            StartTime = startTime;
            EndTime = endTime;
            Notes = notes ?? string.Empty;
        }
        public Guid Id { get; set; }

        // Patient
        [Required]
        public Guid PatientId { get; set; }
        public Patient Patient { get; set; } = default!;

        // Doctor
        [Required]
        public Guid DoctorId { get; set; }
        public Doctor Doctor { get; set; } = default!;

        // Type + Status
        public AppointmentType Type { get; set; }
        public AppointmentStatus Status { get; set; }

        // Date & time
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        // Notes
        [MaxLength(2000)]
        public string Notes { get; set; }


    }
    public enum AppointmentType
    {
        Consulatation = 0,
        FollowUp = 1,
        Emergency = 2

    }
    public enum AppointmentStatus
    {
        Scheduled = 0,
        Completed = 1,
        Canceled = 2
    }

   
}
