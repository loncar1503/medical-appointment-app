using MedicalAppointment.Api.DTOs.Ai;
using MedicalAppointment.Api.OpenAI;
using MedicalAppointment.Application.DTOs.Appointment;
using MedicalAppointment.Application.DTOs.Patient;
using MedicalAppointment.Application.IServices;
using MedicalAppointment.Domain.Entities;
using MedicalAppointment.Domain.IRepositories;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace MedicalAppointment.Api.Controllers;

[ApiController]
[Route("api/ai")]
public class AiController : ControllerBase
{
    private readonly OpenAiClient _ai;
    private readonly IPatientService _patients;
    private readonly IAppointmentService _appointments;

    private readonly IPatientRepository _patientRepository;

    public AiController(OpenAiClient ai, IPatientRepository patientRepository, IAppointmentService appointments, IPatientService patientService)
    {
        _ai = ai;
        _patientRepository = patientRepository;
        _appointments = appointments;
        _patients = patientService;
    }

    [HttpPost("patients")]
    public async Task<ActionResult<BulkInsertPatientsResponse>> GeneratePatients([FromQuery] int count = 10, CancellationToken ct = default)
    {
        var json = await _ai.GeneratePatientsJsonAsync(count, ct);

        var list = JsonSerializer.Deserialize<List<CreatePatientDTO>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (list == null || list.Count == 0)
            return BadRequest("AI returned an empty list.");

        var result = await _patients.BulkInsertAsync(list);
        return Ok(result);
    }


    [HttpPost("schedule")]
    public async Task<IActionResult> Schedule(
        [FromBody] ScheduleAppointmentRequest request,
        CancellationToken ct)
    {
        var intent = await _ai.GenerateAppointmentIntentAsync(request.Text, ct);

        if (string.IsNullOrWhiteSpace(intent.PatientFullName))
            return BadRequest("Patient name missing.");

        var parts = intent.PatientFullName.Split(' ');
        if (parts.Length < 2)
            return BadRequest("Invalid patient name.");

        var patient = (await _patientRepository.GetAllAsync())
        .FirstOrDefault(p =>
            p.FirstName.Equals(parts[0], StringComparison.OrdinalIgnoreCase) &&
            p.LastName.Equals(parts[1], StringComparison.OrdinalIgnoreCase));

        if (patient == null)
            return NotFound("Patient not found.");

        if (string.IsNullOrWhiteSpace(intent.Specialization) || string.IsNullOrWhiteSpace(intent.AppointmentType))
            return BadRequest("Could not extract specialization/type.");

        var specialization = Enum.Parse<Specialization>(intent.Specialization!, true);
        var type = Enum.Parse<AppointmentType>(intent.AppointmentType!, true);

        var result = await _appointments.ScheduleFromIntentAsync(patient, specialization, type);
        var doctor = result.doctor;
        var start = result.start;
        var end = result.end;

        var dto = new CreateAppointmentDTO
        {
            PatientId = patient.Id,
            DoctorId = doctor.Id,
            StartTime = start,
            EndTime = end,
            Status = AppointmentStatus.Scheduled,
            Type = type,
            Notes = intent.Notes ?? "AI scheduled."
        };

        var created = await _appointments.CreateAsync(dto);

        var message = await _ai.GenerateScheduleMessageAsync(
    $"{patient.FirstName} {patient.LastName}",
    $"{doctor.FirstName} {doctor.LastName}",
    start,
    type,
    ct);

        return Ok(new
        {
            created.Id,
            Doctor = $"{doctor.FirstName} {doctor.LastName}",
            Start = start,
            End = end,
            Message = message
        });
    }
}