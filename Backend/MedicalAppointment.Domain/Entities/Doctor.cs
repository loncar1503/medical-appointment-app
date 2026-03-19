using MedicalAppointment.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Domain.Entities
{
    public class Doctor
    {
        public Guid Id { get; private set; }

        [Required, MaxLength(120)]
        public string FirstName { get; set; } = default!;
        [Required, MaxLength(120)]
        public string LastName { get; set; }

        // Specialization
        [Required, MaxLength(120)]
        public Specialization Specialization { get; set; } = default!;

        public string Email { get; set; }

        [MaxLength(40)]
        [Phone]
        public string Phone { get; set; }
        // Assigned appointments
        public List<Appointment> Appointments { get; private set; } = new();

        public List<AvailablilitySlot> AvailableSlots { get; set; } = new();

        public Doctor(string firstName, string lastName, string email, string phone, Specialization specialization)
        {
            if (string.IsNullOrWhiteSpace(firstName))
                throw new DomainValidationException("First name is required");
            if (string.IsNullOrWhiteSpace(lastName))
                throw new DomainValidationException("Last name is required");
            FirstName = firstName;
            LastName = lastName;
            Email = email;
            Phone = phone;
            Specialization = specialization;
        }
    }

    public enum Specialization
    {
        GeneralPracticioner = 0,
        Dentist =1,
        Surgeon=2
        
    }}
