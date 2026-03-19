using MedicalAppointment.Application.DTOs.AvailableSlot;
using MedicalAppointment.Application.DTOs.Doctor;

using MedicalAppointment.Application.DTOs.Doctor;
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
    public class DoctorService : IDoctorService
    {
        private readonly IDoctorRepository _repository;
        private readonly ICsvExporter _csvExporter;
        private readonly IAvailabilitySlotRepository _availabilitySlotRepository;

        public DoctorService(IDoctorRepository repository, ICsvExporter csvExporter, IAvailabilitySlotRepository availabilitySlotRepository)
        {
            _repository = repository;
            _csvExporter = csvExporter;
            _availabilitySlotRepository = availabilitySlotRepository;

        }
       
        public async Task<BulkInsertDoctorsResponse> BulkInsertAsync(List<CreateDoctorDTO> doctors)
        {
            var response = new BulkInsertDoctorsResponse();

            foreach (var dto in doctors)
            {
                var validationError = Validate(dto);

                if (validationError != null)
                {
                    response.FailedRecords.Add(new FailedDoctorRecord
                    {
                        Doctor = dto,
                        Error = validationError
                    });
                    continue;
                }

                try
                {
                    Doctor entity = new Doctor(dto.FirstName, dto.LastName, dto.Email, dto.Phone, dto.Specialization);


                    await _repository.AddAsync(entity);

                    response.SavedIds.Add(entity.Id);
                }
                catch (Exception ex)
                {
                    response.FailedRecords.Add(new FailedDoctorRecord
                    {
                        Doctor = dto,
                        Error = ex.Message
                    });
                }
            }

            return response;
        }

        private string? Validate(CreateDoctorDTO dto)
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

        public async Task<Doctor> CreateAsync(CreateDoctorDTO doctor)
        {
            Guid medicalId = Guid.NewGuid();
            Doctor _doctor = new Doctor(doctor.FirstName,doctor.LastName,doctor.Email,doctor.Phone,doctor.Specialization);
            await _repository.AddAsync(_doctor);
            return _doctor;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
           var doctor = await _repository.GetByIdAsync(id);
            if (doctor == null)
                return false;
            await _repository.DeleteAsync(doctor);
            return true;
        }

        public async Task<List<ReturnDoctorDTO>> GetAllAsync(int? page = null, int? pageSize = null)
        {
            var doctors = await _repository.GetAllAsync();

            if (page.HasValue && pageSize.HasValue)
            {
                doctors = doctors
                    .Skip((page.Value - 1) * pageSize.Value)
                    .Take(pageSize.Value)
                    .ToList();
            }

            return doctors.Select(p => new ReturnDoctorDTO
            {
                Id = p.Id,
                FirstName = p.FirstName,
                LastName = p.LastName,
                Email = p.Email,
                Phone = p.Phone,
                Specialization = p.Specialization
            }).ToList();
        }

        public async Task<byte[]> GetAllDoctorsCsvAsync()
        {
            var doctors = await _repository.GetAllAsync();

            var dtoList = doctors.Select(d => new ReturnDoctorDTO
            {
                Id = d.Id,
                FirstName = d.FirstName,
                LastName = d.LastName,
                Email = d.Email,
                Phone = d.Phone,
                Specialization = d.Specialization
            }).ToList();

            return _csvExporter.ExportDoctors(dtoList);
        }
        

        public async Task<Doctor?> GetByIdAsync(Guid id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<Doctor?> UpdateAsync(Guid id, UpdateDoctorDTO dto)
        {
            var doctor = await _repository.GetByIdAsync(id);

            if (doctor == null)
                return null;

            if (string.IsNullOrWhiteSpace(dto.FirstName))
                throw new DomainValidationException("First name is required");

            if (string.IsNullOrWhiteSpace(dto.LastName))
                throw new DomainValidationException("Last name is required");

            if (!Enum.IsDefined(typeof(Specialization), dto.Specialization))
                throw new DomainValidationException("Invalid specialization");

            doctor.FirstName = dto.FirstName;
            doctor.LastName = dto.LastName;
            doctor.Email = dto.Email;
            doctor.Phone = dto.Phone;
            doctor.Specialization=dto.Specialization;

            await _repository.UpdateAsync(doctor);

            return doctor;
        }
        public async Task<List<ReturnAvailabilitySlotDTO>> GetAvailableSlotsByDoctorAndDate(
     Guid? doctorId,
     DateTime? date)
        {
            var slots = await _availabilitySlotRepository.GetByDoctorAndDateAsync(doctorId, date);

            return slots.Select(s => new ReturnAvailabilitySlotDTO
            {
                Id = s.Id,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                IsBooked = s.IsBooked,
                DoctorId = s.DoctorId
            }).ToList();
        }


    }
}
