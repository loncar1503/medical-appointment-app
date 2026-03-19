using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Api.DTOs.Ai;

public sealed class AppointmentIntent
{
    public string? PatientFullName { get; set; }   
    public string? Specialization { get; set; }    
    public string? AppointmentType { get; set; }   
    public string? TimePreference { get; set; }    
    public string? Notes { get; set; }             
}
