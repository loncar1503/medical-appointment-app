using MedicalAppointment.Application.DTOs.Patient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Application.DTOs.Doctor
{
    public class BulkInsertDoctorsResponse
    {
        public List<Guid> SavedIds { get; set; } = new();
        public List<FailedDoctorRecord> FailedRecords { get; set; } = new();
    }

    public class FailedDoctorRecord
    {
        public CreateDoctorDTO Doctor { get; set; }
        public string Error { get; set; }
    }
}
