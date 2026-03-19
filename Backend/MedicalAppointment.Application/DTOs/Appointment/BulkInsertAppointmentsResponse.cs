using MedicalAppointment.Application.DTOs.Doctor;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Application.DTOs.Appointment
{
    public class BulkInsertAppointmentsResponse
    {
       
            public List<Guid> SavedIds { get; set; } = new();
            public List<FailedAppointmentsRecord> FailedRecords { get; set; } = new();
    }

        public class FailedAppointmentsRecord
        {
            public CreateAppointmentDTO Appointment { get; set; }
            public string Error { get; set; }
        }

}

