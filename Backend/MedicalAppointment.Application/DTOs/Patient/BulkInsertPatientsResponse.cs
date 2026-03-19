using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Application.DTOs.Patient
{
    public class BulkInsertPatientsResponse
    {
        public List<Guid> SavedIds { get; set; } = new();
        public List<FailedPatientRecord> FailedRecords { get; set; } = new();
    }

    public class FailedPatientRecord
    {
        public CreatePatientDTO Patient { get; set; }
        public string Error { get; set; }
    }
}
