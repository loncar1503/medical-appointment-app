using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Application.IServices
{
    public interface IAvailabilityService
    {
        Task BookSlots(Guid doctorId, DateTime start, DateTime end);
        Task ReleaseSlots(Guid doctorId, DateTime start, DateTime end);
    }
}
