using Bogus;
using MedicalAppointment.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Infrastructure.Data
{
    public static class SeedHelpers
    {
        public static string GenerateSerbianPhone(Faker f)
        {
            var prefixes = new[] { "060", "061", "062", "063", "064", "065", "066", "069" };
            var prefix = f.PickRandom(prefixes);

            var numberLength = f.Random.Bool() ? 7 : 8;
            var number = f.Random.ReplaceNumbers(new string('#', numberLength));

            return $"+381{prefix.Substring(1)}{number}";
        }
        public static List<AvailablilitySlot> GenerateForDays(
        Guid doctorId,
        DateTime startDate,
        int numberOfDays,
        TimeSpan minWorkStart,
        TimeSpan maxWorkEnd,
        TimeSpan? breakStart = null,
        TimeSpan? breakEnd = null)
        {
            var slots = new List<AvailablilitySlot>();
            var faker = new Bogus.Faker();

            for (int i = 0; i < numberOfDays; i++)
            {
                var currentDate = startDate.Date.AddDays(i);

                if (currentDate.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
                    continue;

                var startHour = faker.Random.Int(minWorkStart.Hours, Math.Min(minWorkStart.Hours + 3, maxWorkEnd.Hours - 2));
                var endHour = faker.Random.Int(startHour + 2, maxWorkEnd.Hours);

                var workStart = currentDate.AddHours(startHour);
                var workEnd = currentDate.AddHours(endHour);

                var current = workStart;

                while (current < workEnd)
                {
                    var slotEnd = current.AddMinutes(30);

                    if (breakStart.HasValue && breakEnd.HasValue)
                    {
                        var breakStartDate = currentDate.Add(breakStart.Value);
                        var breakEndDate = currentDate.Add(breakEnd.Value);

                        if (current >= breakStartDate && current < breakEndDate)
                        {
                            current = slotEnd;
                            continue;
                        }
                    }

                    slots.Add(new AvailablilitySlot
                    {
                        Id = Guid.NewGuid(),
                        DoctorId = doctorId,
                        StartTime = current,
                        EndTime = slotEnd,
                        IsBooked = false
                    });

                    current = slotEnd;
                }
            }

            return slots;
        }
    }
}
