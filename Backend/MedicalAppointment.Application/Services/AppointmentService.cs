using MedicalAppointment.Application.DTOs.Appointment;
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
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _repository;
        private readonly IPatientRepository _patientRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly ICsvExporter _csvExporter;
        private readonly IAvailabilityService _availabilityService;
        private readonly IAvailabilitySlotRepository _slotRepository;
        public AppointmentService(IAppointmentRepository repository,
            IPatientRepository patientRepository,
            IDoctorRepository doctorRepository,
            ICsvExporter csvExporter,
            IAvailabilityService availabilityService,
            IAvailabilitySlotRepository slotRepository)
        {
            _repository = repository;
            _patientRepository = patientRepository;
            _doctorRepository = doctorRepository;
            _csvExporter = csvExporter;
            _availabilityService = availabilityService;
            _slotRepository = slotRepository;
        }
        public async Task<Appointment> CreateAsync(CreateAppointmentDTO appoinment)
        {
            var patient = await _patientRepository.GetByIdAsync(appoinment.PatientId);
            if (patient is null)
                throw new DomainValidationException("Patient does not exist");

            var doctor = await _doctorRepository.GetByIdAsync(appoinment.DoctorId);
            if (doctor is null)
                throw new DomainValidationException("Doctor does not exist");
            if (!Enum.IsDefined(typeof(AppointmentType), appoinment.Type))

                throw new DomainValidationException("Invalid appointment type.");

            if (!Enum.IsDefined(typeof(AppointmentStatus), appoinment.Status))

                throw new DomainValidationException("Invalid appointment status.");
            Appointment app = new Appointment(appoinment.PatientId, appoinment.DoctorId, appoinment.Type, appoinment.StartTime, appoinment.EndTime, appoinment.Notes);

            await _availabilityService.BookSlots(
                    appoinment.DoctorId,
                    appoinment.StartTime,
                    appoinment.EndTime
                );
            return await _repository.AddAsync(app);
        }


        public async Task<(Doctor doctor, DateTime start, DateTime end)> ScheduleFromIntentAsync(
                Patient patient,
                Specialization specialization,
                AppointmentType type
                )
        {
            var doctors = await _doctorRepository.GetAllAsync();
            var filtered = doctors
                .Where(d => d.Specialization == specialization)
                .ToList();

            if (!filtered.Any())
                throw new InvalidOperationException("No doctors for that specialization.");

            int slotDuration = type == AppointmentType.Emergency ? 30 : 30;
            var now = DateTime.UtcNow;
            int daysAhead = 7;

            foreach (var doctor in filtered)
            {
                for (int day = 0; day < daysAhead; day++)
                {
                    var date = now.Date.AddDays(day);
                    var slots = await _slotRepository.GetByDoctorAndDateAsync(doctor.Id, date);

                    var freeSlots = slots
                        .Where(s => !s.IsBooked && s.StartTime >= now)
                        .OrderBy(s => s.StartTime)
                        .ToList();

                    foreach (var slot in freeSlots)
                    {
                        var start = slot.StartTime;
                        var end = start.AddMinutes(slotDuration);

                        var overlap = await _repository
                            .HasOverlapAsync(doctor.Id, patient.Id, start, end);

                        if (!overlap)
                        {
                            return (doctor, start, end);
                        }
                    }
                }
            }

            throw new InvalidOperationException("No available slot found.");
        }
        public async Task<bool> DeleteAsync(Guid id)
        {
            var appointment = await _repository.GetByIdAsync(id);

            if (appointment == null)
                return false;

            await _availabilityService.ReleaseSlots(
                appointment.DoctorId,
                appointment.StartTime,
                appointment.EndTime
            );
            await _repository.DeleteAsync(id);

            return true;
        }

        public async Task<Appointment?> GetByIdAsync(Guid id)
        {
            return await _repository.GetByIdAsync(id);
        }


        public async Task<Appointment> UpdateAsync(Guid Id, UpdateAppointmentDTO appoinment)
        {
            var app = await _repository.GetByIdAsync(Id);
            if (app is null)
                throw new DomainValidationException("Appointment does not exist");

            var patient = await _patientRepository.GetByIdAsync(appoinment.PatientId);
            if (patient is null)
                throw new DomainValidationException("Patient does not exist");

            var doctor = await _doctorRepository.GetByIdAsync(appoinment.DoctorId);
            if (doctor is null)
                throw new DomainValidationException("Doctor does not exist");


            if (!Enum.IsDefined(typeof(AppointmentType), appoinment.Type))
                throw new DomainValidationException("Invalid appointment type.");

            if (!Enum.IsDefined(typeof(AppointmentStatus), appoinment.Status))
                throw new DomainValidationException("Invalid appointment status.");

            if (appoinment.StartTime >= appoinment.EndTime)
                throw new DomainValidationException("Start time must be before end time");

            if (appoinment.StartTime < DateTime.UtcNow)
                throw new DomainValidationException("Appointment cannot be scheduled in the past");

            if (!string.IsNullOrWhiteSpace(appoinment.Notes) && appoinment.Notes.Length > 2000)
                throw new DomainValidationException("Notes cannot exceed 2000 characters");

            var oldDoctorId = app.DoctorId;
            var oldStart = app.StartTime;
            var oldEnd = app.EndTime;

            var changedSlot = oldDoctorId != appoinment.DoctorId || oldStart != appoinment.StartTime || oldEnd != appoinment.EndTime;

            if (changedSlot ||(app.Status==AppointmentStatus.Canceled && appoinment.Status==AppointmentStatus.Scheduled))
            {
                await _availabilityService.ReleaseSlots(oldDoctorId, oldStart, oldEnd);
                await _availabilityService.BookSlots(appoinment.DoctorId, appoinment.StartTime, appoinment.EndTime);
            }

            app.Status = appoinment.Status;
            app.PatientId = appoinment.PatientId;
            app.DoctorId = appoinment.DoctorId;
            app.Type = appoinment.Type;
            app.StartTime = appoinment.StartTime;
            app.EndTime = appoinment.EndTime;
            app.Notes = appoinment.Notes;
            if (oldDoctorId==app.DoctorId && app.Status == AppointmentStatus.Canceled)
            {
                await _availabilityService.ReleaseSlots(oldDoctorId, app.StartTime, app.EndTime);

            }
            if (!Enum.IsDefined(typeof(AppointmentType), appoinment.Type))

                throw new DomainValidationException("Invalid appointment type.");

            if (!Enum.IsDefined(typeof(AppointmentStatus), appoinment.Status))

                throw new DomainValidationException("Invalid appointment status.");


            return await _repository.UpdateAsync(app);
        }

        public async Task<List<ReturnAppointmentDTO>> GetAllAsync()
        {
            var appointments = await _repository.GetAllAsync();

            return appointments.Select(a => new ReturnAppointmentDTO
            {
                Id = a.Id,
                Type = a.Type,
                Status = a.Status,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                Notes = a.Notes ?? string.Empty,

                Doctor = new ReturnDoctorDTO
                {
                    Id = a.Doctor.Id,
                    FirstName = a.Doctor.FirstName,
                    LastName = a.Doctor.LastName,
                    Specialization = a.Doctor.Specialization,
                    Email = a.Doctor.Email ?? string.Empty,
                    Phone = a.Doctor.Phone ?? string.Empty
                },

                Patient = new ReturnPatientDTO
                {
                    Id = a.Patient.Id,
                    FirstName = a.Patient.FirstName,
                    LastName = a.Patient.LastName,
                    Email = a.Patient.Email,
                    Phone = a.Patient.Phone,
                    MedicalId = a.Patient.MedicalId
                }
            }).ToList();
        }


        public async Task<List<ReturnAppointmentDTO>> GetAllFilteredAsync(
            Guid? doctorId,
            Guid? patientId,
            AppointmentType? type,
            AppointmentStatus? status,
            DateTime? startFrom,
            DateTime? startTo,
            string? notesContains,
            string? sortBy,
            bool sortDesc)
                {
            if (type.HasValue && !Enum.IsDefined(typeof(AppointmentType), type.Value))
                throw new DomainValidationException("Invalid appointment type.");

            if (status.HasValue && !Enum.IsDefined(typeof(AppointmentStatus), status.Value))
                throw new DomainValidationException("Invalid appointment status.");

            var appointments = await _repository.GetAllFilteredAsync(
                doctorId, patientId, type, status, startFrom, startTo, notesContains, sortBy, sortDesc);

            return appointments.Select(a => new ReturnAppointmentDTO
            {
                Id = a.Id,
                Type = a.Type,
                Status = a.Status,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                Notes = a.Notes ?? string.Empty,

                Doctor = new ReturnDoctorDTO
                {
                    Id = a.Doctor.Id,
                    FirstName = a.Doctor.FirstName,
                    LastName = a.Doctor.LastName,
                    Specialization = a.Doctor.Specialization,
                    Email = a.Doctor.Email ?? string.Empty,
                    Phone = a.Doctor.Phone ?? string.Empty
                },

                Patient = new ReturnPatientDTO
                {
                    Id = a.Patient.Id,
                    FirstName = a.Patient.FirstName,
                    LastName = a.Patient.LastName,
                    Email = a.Patient.Email,
                    Phone = a.Patient.Phone,
                    MedicalId = a.Patient.MedicalId
                }
            }).ToList();
        }
        public async Task<byte[]> GetAllAppointmentsCsvAsync()
        {
            var appointments = await _repository.GetAllAsync();

            var dtoList = appointments.Select(a => new ReturnAppointmentDTO
            {
                Id = a.Id,
                Type = a.Type,
                Status = a.Status,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                Notes = a.Notes,
                Doctor = new ReturnDoctorDTO
                {
                    Id = a.Doctor.Id,
                    FirstName = a.Doctor.FirstName,
                    LastName = a.Doctor.LastName,
                    Email = a.Doctor.Email,
                    Phone = a.Doctor.Phone,
                    Specialization = a.Doctor.Specialization,
                },
                Patient = new ReturnPatientDTO
                {
                    Id = a.Patient.Id,
                    FirstName = a.Patient.FirstName,
                    LastName = a.Patient.LastName,
                    Email = a.Patient.Email,
                    Phone = a.Patient.Phone,
                    MedicalId = a.Patient.MedicalId
                }
            }).ToList();

            return _csvExporter.ExportAppointments(dtoList);
        }

        public async Task<BulkInsertAppointmentsResponse> BulkInsertAsync(List<CreateAppointmentBulkDTO> appointments)
        {
            var response = new BulkInsertAppointmentsResponse();
            if (appointments == null || appointments.Count == 0)
                return response;

            var medicalIds = appointments
                .Select(a => a.PatientMedicalId)
                .Distinct()
                .ToList();

            var doctorEmails = appointments
                .Where(a => !string.IsNullOrWhiteSpace(a.DoctorEmail))
                .Select(a => a.DoctorEmail.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            var patients = await _patientRepository.GetByMedicalIdsAsync(medicalIds);
            var doctors = await _doctorRepository.GetByEmailsAsync(doctorEmails);

            var patientByMedicalId = patients.ToDictionary(p => p.MedicalId, p => p.Id);

            var doctorByEmail = doctors
                .Where(d => !string.IsNullOrWhiteSpace(d.Email))
                .ToDictionary(d => d.Email!.Trim().ToLowerInvariant(), d => d.Id);

            foreach (var bulk in appointments)
            {
                var createDto = new CreateAppointmentDTO
                {
                    PatientId = Guid.Empty,
                    DoctorId = Guid.Empty,
                    Type = bulk.Type,
                    Status = bulk.Status,
                    StartTime = bulk.StartTime,
                    EndTime = bulk.EndTime,
                    Notes = bulk.Notes
                };
                var validationError = Validate(bulk);

                if (validationError != null)
                {
                    response.FailedRecords.Add(new FailedAppointmentsRecord
                    {
                        Appointment = createDto,
                        Error = validationError
                    });
                    continue;
                }
                if (!patientByMedicalId.TryGetValue(bulk.PatientMedicalId, out var patientId))
                {
                    response.FailedRecords.Add(new FailedAppointmentsRecord
                    {
                        Appointment = createDto,
                        Error = $"Patient does not exist (medicalId: {bulk.PatientMedicalId})"
                    });
                    continue;
                }

                var normalizedEmail = bulk.DoctorEmail.Trim().ToLowerInvariant();
                if (!doctorByEmail.TryGetValue(normalizedEmail, out var doctorId))
                {
                    response.FailedRecords.Add(new FailedAppointmentsRecord
                    {
                        Appointment = createDto,
                        Error = $"Doctor does not exist (email: {bulk.DoctorEmail})"
                    });
                    continue;
                }

                createDto.PatientId = patientId;
                createDto.DoctorId = doctorId;

                try
                {
                    var created = await CreateAsync(createDto);
                    response.SavedIds.Add(created.Id);
                }
                catch (Exception ex)
                {
                    response.FailedRecords.Add(new FailedAppointmentsRecord
                    {
                        Appointment = createDto,
                        Error = ex.Message
                    });
                }
            }

            return response;
        }

        private string? Validate(CreateAppointmentBulkDTO dto)
        {
            if (dto.PatientMedicalId == Guid.Empty)
                return "PatientMedicalId must be a valid GUID";

            if (string.IsNullOrWhiteSpace(dto.DoctorEmail))
                return "DoctorEmail must be a valid email";

            if (dto.StartTime >= dto.EndTime)
                return "StartTime must be before EndTime";

            if (dto.StartTime < DateTime.UtcNow)
                return "Appointment cannot be scheduled in the past";

            if (!string.IsNullOrWhiteSpace(dto.Notes) && dto.Notes.Length > 2000)
                return "Notes cannot exceed 2000 characters";

            if (!Enum.IsDefined(typeof(AppointmentType), dto.Type))
                return "Invalid appointment type";

            if (!Enum.IsDefined(typeof(AppointmentStatus), dto.Status))
                return "Invalid appointment status";

            return null; 
        }


    }
}

