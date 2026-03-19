using MedicalAppointment.Application.DTOs.Appointment;
using MedicalAppointment.Application.DTOs.Doctor;
using MedicalAppointment.Application.IServices;
using MedicalAppointment.Domain.Entities;
using MedicalAppointment.Domain.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedicalAppointment.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;
        public AppointmentController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        [HttpPost]
        public async Task<ActionResult<Appointment>> Create([FromBody] CreateAppointmentDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _appointmentService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (DomainValidationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, "Database error while saving appointment");
            }
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<Appointment>> GetById(Guid id)
        {
            var appointment = await _appointmentService.GetByIdAsync(id);

            if (appointment == null)
                return NotFound();

            return Ok(appointment);
        }


        [HttpPut("{id:guid}")]
        public async Task<ActionResult<Appointment>> Update(Guid id, [FromBody] UpdateAppointmentDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            try
            {
                var updated = await _appointmentService.UpdateAsync(id, dto);
                if (updated == null)
                    return NotFound();
                return Ok(updated);
            }
            catch (DomainValidationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, "Database error while updating appointment");
            }
        }
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _appointmentService.DeleteAsync(id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }

        [HttpGet]
        public async Task<ActionResult<List<ReturnAppointmentDTO>>> GetAll()
        {
            var result = await _appointmentService.GetAllAsync();
            return Ok(result);
        }


        [HttpGet("filtered")]
        public async Task<ActionResult<List<ReturnAppointmentDTO>>> GetAllFilter(
        [FromQuery] Guid? doctorId,
        [FromQuery] Guid? patientId,
        [FromQuery] AppointmentType? type,
        [FromQuery] AppointmentStatus? status,
        [FromQuery] DateTime? startFrom,
        [FromQuery] DateTime? startTo,
        [FromQuery] string? notesContains,
        [FromQuery] string? sortBy,
        [FromQuery] bool sortDesc = true)
        {
            var result = await _appointmentService.GetAllFilteredAsync(
                doctorId, patientId, type, status, startFrom, startTo, notesContains, sortBy, sortDesc);

            return Ok(result);
        }


        [HttpGet("export")]
        public async Task<IActionResult> ExportAppointmentsCsv()
        {
            var csvBytes = await _appointmentService.GetAllAppointmentsCsvAsync();
            return File(csvBytes, "text/csv", "appointments.csv");
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> BulkInsert([FromBody] List<CreateAppointmentBulkDTO> appointments)
        {
            if (appointments == null || !appointments.Any())
                return BadRequest("Appointments list cannot be empty.");

            var result = await _appointmentService.BulkInsertAsync(appointments);

            return Ok(result);
        }

    }
}
