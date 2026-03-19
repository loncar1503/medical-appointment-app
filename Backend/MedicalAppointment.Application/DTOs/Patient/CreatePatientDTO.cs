using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Application.DTOs.Patient
{
    public class CreatePatientDTO
    {
        [Required]
        [MaxLength(20)]
        public string FirstName { get; set; } = string.Empty;
        [Required]
        [MaxLength(20)]
        public string LastName { get; set; } = string.Empty;
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        [Required]
        [RegularExpression(@"^(?:\+3816\d{7,8}|06\d{7,8})$", ErrorMessage = "Invalid Serbian phone number")]
        public string Phone { get; set; } = string.Empty; 

    }
}
