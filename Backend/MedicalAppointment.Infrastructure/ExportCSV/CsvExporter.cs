using MedicalAppointment.Application.DTOs.Appointment;
using MedicalAppointment.Application.DTOs.Doctor;
using MedicalAppointment.Application.DTOs.Patient;
using MedicalAppointment.Application.ExportCSV;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace MedicalAppointment.Infrastructure.ExportCSV
{
    public class CsvExporter : ICsvExporter
    {

        public byte[] ExportAppointments(IEnumerable<ReturnAppointmentDTO> appointments)
        {
            var sb = new StringBuilder();

            sb.AppendLine("Id,PatientId,PatientFullName,PatientEmail,PatientPhone," +
                          "DoctorId,DoctorFullName,DoctorEmail,DoctorPhone,Specialization," +
                          "Type,Status,StartTime,EndTime,Notes");

            foreach (var a in appointments)
            {
                sb.AppendLine(
                    $"{a.Id}," +
                    $"{a.Patient.Id}," +
                    $"{Escape(a.Patient.FullName)}," +
                    $"{Escape(a.Patient.Email)}," +
                    $"{Escape(a.Patient.Phone)}," +
                    $"{a.Doctor.Id}," +
                    $"{Escape(a.Doctor.FullName)}," +
                    $"{Escape(a.Doctor.Email)}," +
                    $"{Escape(a.Doctor.Phone)}," +
                    $"{a.Doctor.Specialization}," +
                    $"{a.Type}," +
                    $"{a.Status}," +
                    $"{a.StartTime:O}," +
                    $"{a.EndTime:O}," +
                    $"{Escape(a.Notes)}"
                );
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        public byte[] ExportDoctors(List<ReturnDoctorDTO> doctors)
        {
            var sb = new StringBuilder();

            sb.AppendLine("Id,FirstName,LastName,Email,Phone,Specialization");

            foreach (var d in doctors)
            {
                sb.AppendLine($"{d.Id},{Escape(d.FirstName)},{Escape(d.LastName)},{Escape(d.Email)},{Escape(d.Phone)},{d.Specialization}");

            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        public byte[] ExportPatients(IEnumerable<ReturnPatientDTO> patients)
        {
            var sb = new StringBuilder();

            sb.AppendLine("Id,FirstName,LastName,Email,Phone,MedicalId");

            foreach (var p in patients)
            {
                sb.AppendLine($"{p.Id},{Escape(p.FirstName)},{Escape(p.LastName)},{Escape(p.Email)},{Escape(p.Phone)},{p.MedicalId}");
            }

            return Encoding.UTF8.GetBytes(sb.ToString());
        }

        private string Escape(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return "";

            // 1) Zameni sve kontrolne karaktere razmakom (ovo hvata \r \n \v \f i ostalo)
            var chars = value.ToCharArray();
            for (int i = 0; i < chars.Length; i++)
            {
                if (char.IsControl(chars[i]))
                    chars[i] = ' ';
            }
            value = new string(chars);

            // 2) Sabij višestruke razmake
            while (value.Contains("  "))
                value = value.Replace("  ", " ");

            value = value.Trim();

            // 3) CSV escape
            if (value.Contains(",") || value.Contains("\""))
            {
                value = value.Replace("\"", "\"\"");
                return $"\"{value}\"";
            }

            return value;
        }
    }
}
