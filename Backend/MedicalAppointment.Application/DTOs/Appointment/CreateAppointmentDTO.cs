using MedicalAppointment.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Application.DTOs.Appointment
{
    public class CreateAppointmentDTO
    {
        [Required]
        public Guid PatientId { get; set; }

        [Required]

        public Guid DoctorId { get; set; }

        [Required]

        public AppointmentType Type { get; set; }


        [Required]

        public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;

        [Required]

        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [MaxLength(2000)]

        [Required]
        public string Notes { get; set; }

    }
}
