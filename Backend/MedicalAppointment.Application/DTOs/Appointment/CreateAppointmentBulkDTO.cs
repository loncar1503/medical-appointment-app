using MedicalAppointment.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Application.DTOs.Appointment
{
    public class CreateAppointmentBulkDTO
    {
        [Required]
        public Guid PatientMedicalId { get; set; }

        [Required, EmailAddress]
        public string DoctorEmail { get; set; } = null!;

        [Required]
        public AppointmentType Type { get; set; }

        [Required]
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [Required, MaxLength(2000)]
        public string Notes { get; set; } = null!;
    }
}
