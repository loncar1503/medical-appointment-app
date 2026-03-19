using MedicalAppointment.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Application.DTOs.Doctor
{
    public class ReturnDoctorDTO
    {
        public Guid Id { get; set; }

        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;

        public string FullName => $"{FirstName} {LastName}";
        public Specialization Specialization { get; set; } = Specialization.GeneralPracticioner;
        public string Email { get; set; }=string.Empty;
        public string Phone { get; set; }=string.Empty;
    }
}
