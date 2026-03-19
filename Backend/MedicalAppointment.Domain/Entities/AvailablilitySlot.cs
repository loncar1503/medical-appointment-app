using MedicalAppointment.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Domain.Entities
{
    public class AvailablilitySlot
    {
        public Guid Id { get; set; }
        public Guid DoctorId { get; set; }
        public Doctor Doctor { get; set; } = default!;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsBooked { get; set; }


        public void MarkAsBooked()
        {
            if (IsBooked)
                throw new DomainValidationException("Slot already booked");

            IsBooked = true;
        }

        public void Release()
        {
            IsBooked = false;
        }


    }


}
