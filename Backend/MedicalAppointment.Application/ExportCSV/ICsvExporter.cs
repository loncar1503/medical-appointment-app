using MedicalAppointment.Application.DTOs.Appointment;
using MedicalAppointment.Application.DTOs.Doctor;
using MedicalAppointment.Application.DTOs.Patient;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Application.ExportCSV
{
    public interface ICsvExporter
    {
        byte[] ExportDoctors(List<ReturnDoctorDTO> dtoList);
        byte[] ExportPatients(IEnumerable<ReturnPatientDTO> patients);
        byte[] ExportAppointments(IEnumerable<ReturnAppointmentDTO> appointments);
    }
}
