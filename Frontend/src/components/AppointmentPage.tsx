
import { useEffect, useMemo, useState } from "react";
import { Appointment, AppointmentType } from "../models/Appointment.model";
import { AppointmentStatus } from "../models/Appointment.model";
import CreateAppointmentModal from "./CreateAppointmentModal";
import AppointmentHeader from "./AppointmentHeader";
import AppointmentFilters from "./AppointmentFilters";
import AppointmentCalendar from "./AppointmentCalendar";
import Sidebar from "./Sidebar";
import UpdateAppointmentModal from "./UpdateAppointmentModal";
import AppFooter from "./AppFooter";
import Emergency from "./Emergency";

type PersonDto = {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
};

type AppointmentApiDto = {
  id: string;
  type: AppointmentType;
  status: AppointmentStatus;
  startTime: string;
  endTime: string;
  notes: string;
  doctor: PersonDto;
  patient: PersonDto;
};

const getFullName = (p?: PersonDto) => {
  if (!p) return "";
  return (p.fullName && p.fullName.trim()) || `${p.firstName} ${p.lastName}`.trim();
};

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [openEmergency, setOpenEmergency] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/Appointment");
        if (!res.ok) throw new Error(`Appointments error: ${res.status}`);
        const aDto = (await res.json()) as AppointmentApiDto[];
        const mapped: Appointment[] = (aDto ?? []).map((a) => ({
          id: a.id,
          doctor: getFullName(a.doctor),
          patient: getFullName(a.patient),
          type: a.type,
          status: a.status,
          start: new Date(a.startTime),
          end: new Date(a.endTime),
          notes: a.notes ?? "",
        }));
        setAppointments(mapped);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Load failed");
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      const res = await fetch(`/api/Appointment/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Error while deleting appointment.");
    }
  };

  const doctorOptions = useMemo(
    () => Array.from(new Set(appointments.map((a) => a.doctor))).sort(),
    [appointments]
  );
  const patientOptions = useMemo(
    () => Array.from(new Set(appointments.map((a) => a.patient))).sort(),
    [appointments]
  );
  const typeOptions = useMemo(
    () => [AppointmentType.Consulatation, AppointmentType.FollowUp, AppointmentType.Emergency],
    []
  );

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (selectedDoctor && a.doctor !== selectedDoctor) return false;
      if (selectedType && a.type !== selectedType) return false;
      if (selectedPatient && a.patient !== selectedPatient) return false;
      if (dateFrom && a.start < new Date(dateFrom)) return false;
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59);
        if (a.start > to) return false;
      }
      return true;
    });
  }, [appointments, selectedDoctor, selectedType, selectedPatient, dateFrom, dateTo]);


  const handleExportCsv = () => {
  window.location.href = "/api/Appointment/export";
};

  return (
<div style={{ padding: "20px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Sidebar
  isOpen={isSidebarOpen}
  onClose={() => setIsSidebarOpen(false)}
  activePath={location.pathname}
  onEmergencyClick={() => setOpenEmergency(true)}
/>
      <Emergency open={openEmergency} onClose={() => setOpenEmergency(false)} />
       

      <AppointmentHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        title="APPOINTMENTS"
        subtitle="Overview & scheduling"
        />

      <AppointmentFilters
        doctorOptions={doctorOptions}
        patientOptions={patientOptions}
        typeOptions={typeOptions}
        selectedDoctor={selectedDoctor}
        selectedPatient={selectedPatient}
        selectedType={selectedType}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDoctorChange={setSelectedDoctor}
        onPatientChange={setSelectedPatient}
        onTypeChange={setSelectedType}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onNewAppointment={() => { setEditingAppointment(null); setIsModalOpen(true); }}
        onDownloadPdf={() => window.print()}
        onExportCsv={handleExportCsv}
      />

    <div style={{ flex: 1 }}>
        {loading && <div style={{ padding: 12 }}>Loading...</div>}
        {!loading && error && <div style={{ padding: 12, color: "crimson" }}>{error}</div>}
        {!loading && !error && (
          <AppointmentCalendar
            appointments={filteredAppointments}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
    </div>
      <div className="print-only">
  <div style={{ display: "flex", alignItems: "center", gap: "92px" }}>
    <h1 className="print-title">Appointment Schedule</h1>
    <img
      src="/image.png"
      alt="Company logo"
      style={{ height: "32px", width: "auto" }}
      onError={(e) => console.log("Logo se nije učitao")}
    />
  </div>
  <table className="print-table">
  <thead>
    <tr>
      <th>Status</th>
      <th>Patient</th>
      <th>Doctor</th>
      <th>Type</th>
      <th>Start</th>
      <th>End</th>
      
    </tr>
  </thead>
  <tbody>
    {filteredAppointments
      .sort((a, b) =>
        new Date(a.start).getTime() - new Date(b.start).getTime()
      )
      .map((a) => (
        <tr key={a.id}>
          <td>{a.status}</td>
          <td>{a.patient}</td>
          <td>{a.doctor}</td>
          <td>{a.type}</td>
          <td>
            {a.start.toLocaleDateString()}{" "}
            {a.start.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </td>
          <td>
            {a.end.toLocaleDateString()}{" "}
            {a.end.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </td>
          
        </tr>
      ))}
  </tbody>
</table>
</div>

      {isModalOpen && !editingAppointment && (
  <CreateAppointmentModal
    appointments={appointments}
    onClose={() => setIsModalOpen(false)}
    onCreate={(newAppointment) => setAppointments((prev) => [...prev, newAppointment])}
  />
)}

{isModalOpen && editingAppointment && (
  <UpdateAppointmentModal
    appointments={appointments}
    appointmentToEdit={editingAppointment}
    onClose={() => {
      setIsModalOpen(false);
      setEditingAppointment(null);
    }}
    onUpdated={(updated) =>
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
    }
  />
)}

<AppFooter />

    </div>
  );
};

export default AppointmentsPage;
