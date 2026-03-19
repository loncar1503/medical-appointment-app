using MedicalAppointment.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Domain.Entities
{
    public class Patient
    {
        public Guid Id { get; set; }

        [Required, MaxLength(120)]
        public string FirstName { get; set; } = default!;
        [Required, MaxLength(120)]
        public string LastName { get; set; }

        [MaxLength(120)]
        [EmailAddress]
        public string? Email { get; set; }

        [MaxLength(40)]
        [Phone]
        public string? Phone { get; set; }

      
        public Guid MedicalId { get; set; }

        public List<Appointment> Appointments { get; set; } = new();
        public Patient(string firstName, string lastName, string email, string phone, Guid medicalId)
        {
            if (string.IsNullOrWhiteSpace(firstName))
                throw new DomainValidationException("First name is required");
            if (string.IsNullOrWhiteSpace(lastName))
                throw new DomainValidationException("Last name is required");
            if (medicalId == Guid.Empty)
                throw new DomainValidationException("MedicalId must be valid GUID");
            FirstName = firstName;
            LastName = lastName;
            Email = email;
            Phone = phone;
            MedicalId = medicalId;
        }
    }
}
