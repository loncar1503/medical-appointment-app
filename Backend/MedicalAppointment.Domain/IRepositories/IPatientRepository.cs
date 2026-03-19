using MedicalAppointment.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalAppointment.Domain.IRepositories
{
    public interface IPatientRepository
    {
        Task<Patient?> GetByIdAsync(Guid id);
        Task<Patient> AddAsync(Patient patient);
        Task<List<Patient>> GetAllAsync();
        Task DeleteAsync(Patient patient);
        Task UpdateAsync(Patient patient);
        Task<List<Patient>> GetByMedicalIdsAsync(IEnumerable<Guid> medicalIds);
    }
}
