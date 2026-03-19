using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Application.DTOs.Patient
{
    public class UpdatePatientDTO
    {
        [Required]
        [MaxLength(120)]
        public string FirstName { get; set; } = default!;

        [Required]
        [MaxLength(120)]
        public string LastName { get; set; } = default!;

        [EmailAddress]
        [MaxLength(120)]
        public string? Email { get; set; }

        [RegularExpression(@"^(?:\+3816\d{7,8}|06\d{7,8})$", ErrorMessage = "Invalid Serbian phone number")]
        public string? Phone { get; set; }
    }
}
