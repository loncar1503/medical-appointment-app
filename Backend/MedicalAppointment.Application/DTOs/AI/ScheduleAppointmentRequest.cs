using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Api.DTOs.Ai;

public sealed class ScheduleAppointmentRequest
{
    public string Text { get; set; } = string.Empty;
}
