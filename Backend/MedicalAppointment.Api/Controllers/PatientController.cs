using MedicalAppointment.Application.DTOs.Patient;
using MedicalAppointment.Application.IServices;
using MedicalAppointment.Application.Services;
using MedicalAppointment.Domain.Entities;
using MedicalAppointment.Domain.Exceptions;
using MedicalAppointment.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedicalAppointment.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientController : ControllerBase
    {
        private readonly IPatientService _service;

        public PatientController(IPatientService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<ActionResult<Patient>> Create([FromBody] CreatePatientDTO patient)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            try
            {
                var created = await _service.CreateAsync(patient);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (DomainValidationException ex)
            {
                return BadRequest(ex.Message);
            }

            catch (DbUpdateException)
            {
                return StatusCode(500, "Databse error while saving patient");
            }
        }
        [HttpGet]
        public async Task<ActionResult<List<ReturnPatientDTO>>> GetAll([FromQuery] int? page = null, [FromQuery] int? pageSize = null)
        {
            var patients = await _service.GetAllAsync(page, pageSize);
            return Ok(patients);
        }
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<Patient>> GetById(Guid id)
        {
            var patient = await _service.GetByIdAsync(id);

            if (patient == null)
                return NotFound();

            return Ok(patient);
        }
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<Patient>> Update(Guid id, [FromBody] UpdatePatientDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _service.UpdateAsync(id, dto);

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
                return StatusCode(500, "Database error while updating patient");
            }
        }
        [HttpGet("export")]
        public async Task<IActionResult> ExportPatientsCsv()
        {
            var csvBytes = await _service.GetAllPatientsCsvAsync();
            return File(csvBytes, "text/csv", "patients.csv");
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> BulkInsert([FromBody] List<CreatePatientDTO> patients)
        {
            if (patients == null || !patients.Any())
                return BadRequest("Patients list cannot be empty.");

            var result = await _service.BulkInsertAsync(patients);

            return Ok(result);
        }

    }
}
