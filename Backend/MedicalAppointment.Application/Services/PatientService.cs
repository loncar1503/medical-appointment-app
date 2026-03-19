using MedicalAppointment.Application.DTOs.Patient;
using MedicalAppointment.Application.ExportCSV;
using MedicalAppointment.Application.IServices;
using MedicalAppointment.Domain.Entities;
using MedicalAppointment.Domain.Exceptions;
using MedicalAppointment.Domain.IRepositories;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace MedicalAppointment.Application.Services
{
    public class PatientService : IPatientService
    {
        private readonly IPatientRepository _repository;

        private readonly ICsvExporter _csvExporter;

        public PatientService(IPatientRepository repository, ICsvExporter csvExporter)
        {
            _repository = repository;
            _csvExporter = csvExporter;
        }

        public async Task<Patient?> GetByIdAsync(Guid id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<Patient> CreateAsync(CreatePatientDTO patient)
        {
            Guid medicalId = Guid.NewGuid();
            Patient newPatient = new Patient(patient.FirstName, patient.LastName, patient.Email, patient.Phone, medicalId);

            var created = await _repository.AddAsync(newPatient);
            return created;
        }


        public async Task<List<ReturnPatientDTO>> GetAllAsync(int? page = null, int? pageSize = null)
        {

            var patients = await _repository.GetAllAsync();

            if (page.HasValue && pageSize.HasValue)
            {
                patients = patients
                    .Skip((page.Value - 1) * pageSize.Value)
                    .Take(pageSize.Value)
                    .ToList();
            }

            return patients.Select(p => new ReturnPatientDTO
            {
                Id = p.Id,
                FirstName = p.FirstName,
                LastName = p.LastName,
                Email = p.Email,
                Phone = p.Phone,
                MedicalId = p.MedicalId
            })
            .ToList();
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var patient = await _repository.GetByIdAsync(id);
            if (patient == null)
                return false;
            await _repository.DeleteAsync(patient);
            return true;

        }

        public async Task<Patient?> UpdateAsync(Guid id, UpdatePatientDTO dto)
        {
            var patient = await _repository.GetByIdAsync(id);

            if (patient == null)
                return null;

            if (string.IsNullOrWhiteSpace(dto.FirstName))
                throw new DomainValidationException("First name is required");

            if (string.IsNullOrWhiteSpace(dto.LastName))
                throw new DomainValidationException("Last name is required");

            patient.FirstName = dto.FirstName;
            patient.LastName = dto.LastName;
            patient.Email = dto.Email;
            patient.Phone = dto.Phone;

            await _repository.UpdateAsync(patient);

            return patient;
        }
        public async Task<byte[]> GetAllPatientsCsvAsync()
        {
            var patients = await _repository.GetAllAsync();

            var dtoList = patients.Select(p => new ReturnPatientDTO
            {
                Id = p.Id,
                FirstName = p.FirstName,
                LastName = p.LastName,
                Email = p.Email,
                Phone = p.Phone,
                MedicalId = p.MedicalId
            }).ToList();

            return _csvExporter.ExportPatients(dtoList);
        }
        public async Task<BulkInsertPatientsResponse> BulkInsertAsync(List<CreatePatientDTO> patients)
        {
            var response = new BulkInsertPatientsResponse();

            foreach (var dto in patients)
            {
                var validationError = Validate(dto);

                if (validationError != null)
                {
                    response.FailedRecords.Add(new FailedPatientRecord
                    {
                        Patient = dto,
                        Error = validationError
                    });
                    continue;
                }

                try
                {
                    Patient entity = new Patient(dto.FirstName, dto.LastName, dto.Email, dto.Phone, Guid.NewGuid());


                    await _repository.AddAsync(entity);

                    response.SavedIds.Add(entity.Id);
                }
                catch (Exception ex)
                {
                    response.FailedRecords.Add(new FailedPatientRecord
                    {
                        Patient = dto,
                        Error = ex.Message
                    });
                }
            }

            return response;
        }

        private string? Validate(CreatePatientDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.FirstName))
                return "First name is required";

            if (string.IsNullOrWhiteSpace(dto.LastName))
                return "Last name is required";

            if (!new EmailAddressAttribute().IsValid(dto.Email))
                return "Invalid email";

            if (string.IsNullOrWhiteSpace(dto.Phone))
                return "Phone is required";

            var phoneRegex = new Regex(@"^(?:\+3816\d{7,8}|06\d{7,8})$");

            if (!phoneRegex.IsMatch(dto.Phone))
                return "Phone must be Serbian number in format +3816xxxxxxx";

            return null;
        }
    }
}
