using MedicalAppointment.Application.DTOs.Doctor;
using MedicalAppointment.Application.DTOs.Patient;
using MedicalAppointment.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Application.DTOs.Appointment
{
    public class ReturnAppointmentDTO
    {
        public Guid Id { get; set; }
        public AppointmentType Type { get; set; }
        public AppointmentStatus Status { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Notes { get; set; } = string.Empty; 
        public ReturnDoctorDTO Doctor { get; set; } = default!;
        public ReturnPatientDTO Patient { get; set; } = default!;

    }
}
