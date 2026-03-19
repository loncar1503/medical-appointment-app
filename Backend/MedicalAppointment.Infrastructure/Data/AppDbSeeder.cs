using Bogus;
using MedicalAppointment.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Infrastructure.Data
{
    public static class AppDbContextSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            var faker = new Faker("en");

            if (!context.Doctors.Any())
            {
                var doctorFaker = new Faker<Doctor>()
                    .CustomInstantiator(f => new Doctor(
                        f.Name.FirstName(),
                        f.Name.LastName(),
                        f.Internet.Email(),
                        SeedHelpers.GenerateSerbianPhone(f),
                        f.PickRandom<Specialization>()
                    ));

                context.Doctors.AddRange(doctorFaker.Generate(20));
                await context.SaveChangesAsync();
            }

            if (!context.Patients.Any())
            {
                var patientFaker = new Faker<Patient>()
                    .CustomInstantiator(f => new Patient(
                        f.Name.FirstName(),
                        f.Name.LastName(),
                        f.Internet.Email(),
                        SeedHelpers.GenerateSerbianPhone(f),
                        Guid.NewGuid()
                    ));

                context.Patients.AddRange(patientFaker.Generate(80));
                await context.SaveChangesAsync();
            }

            var doctors = context.Doctors.ToList();
            var patients = context.Patients.ToList();

            if (!context.AvailabilitySlots.Any())
            {
                var from = DateTime.UtcNow.Date.AddDays(1);
                var until = from.AddMonths(1);
                var days = (int)(until - from).TotalDays;

                var allSlots = new List<AvailablilitySlot>();

                foreach (var doctor in doctors)
                {
                    var startHour = faker.Random.Int(7, 9);
                    var workHours = faker.Random.Int(6, 9);
                    var endHour = startHour + workHours;

                    TimeSpan? breakStart = null;
                    TimeSpan? breakEnd = null;

                    if (faker.Random.Bool(0.7f))
                    {
                        var breakHour = faker.Random.Int(startHour + 2, endHour - 2);
                        breakStart = new TimeSpan(breakHour, 0, 0);
                        breakEnd = breakStart.Value.Add(TimeSpan.FromMinutes(30));
                    }

                    var slots = SeedHelpers.GenerateForDays(
                        doctor.Id,
                        from,
                        days,
                        new TimeSpan(startHour, 0, 0),
                        new TimeSpan(endHour, 0, 0),
                        breakStart,
                        breakEnd
                    );

                    allSlots.AddRange(slots);
                }

                context.AvailabilitySlots.AddRange(allSlots);
                await context.SaveChangesAsync();
            }

            if (!context.Appointments.Any())
            {
                var from = DateTime.UtcNow.Date.AddDays(1);
                var until = from.AddMonths(1);

                var slots = await context.AvailabilitySlots
                    .AsNoTracking()
                    .Where(s => s.StartTime >= from && s.StartTime < until)
                    .OrderBy(s => s.DoctorId)
                    .ThenBy(s => s.StartTime)
                    .ToListAsync();

                if (slots.Count == 0) return;

                var slotByDoctorAndStart = slots.ToDictionary(
                    s => (s.DoctorId, s.StartTime),
                    s => s
                );

                var takenSlotKeys = new HashSet<(Guid DoctorId, DateTime StartTime)>();
                var appointments = new List<Appointment>();

                var target = doctors.Count * 10;
                var maxAttempts = target * 50;

                var firstCandidates = slots
                    .Where(s => s.EndTime < until)
                    .ToList();

                for (int attempt = 0; attempt < maxAttempts && appointments.Count < target; attempt++)
                {
                    var doctor = faker.PickRandom(doctors);
                    var patient = faker.PickRandom(patients);

                    var doctorSlots = firstCandidates.Where(s => s.DoctorId == doctor.Id).ToList();
                    if (doctorSlots.Count == 0) continue;

                    var first = faker.PickRandom(doctorSlots);

                    var slotCount = faker.Random.Bool(0.7f) ? 2 : 3;

                    var chain = new List<AvailablilitySlot> { first };
                    var ok = true;

                    for (int i = 1; i < slotCount; i++)
                    {
                        var nextStart = chain[i - 1].EndTime;

                        if (nextStart >= until) { ok = false; break; }

                        if (!slotByDoctorAndStart.TryGetValue((doctor.Id, nextStart), out var nextSlot))
                        {
                            ok = false;
                            break;
                        }

                        chain.Add(nextSlot);
                    }

                    if (!ok) continue;

                    if (chain.Any(s => takenSlotKeys.Contains((s.DoctorId, s.StartTime))))
                        continue;

                    foreach (var s in chain)
                        takenSlotKeys.Add((s.DoctorId, s.StartTime));

                    var start = chain.First().StartTime;
                    var end = chain.Last().EndTime;

                    var appt = new Appointment(
                        patient.Id,
                        doctor.Id,
                        faker.PickRandom<AppointmentType>(),
                        start,
                        end,
                        faker.Lorem.Sentences(2)
                    );

                    appointments.Add(appt);
                }

                context.Appointments.AddRange(appointments);
                await context.SaveChangesAsync();
            }
        }
    }
}
