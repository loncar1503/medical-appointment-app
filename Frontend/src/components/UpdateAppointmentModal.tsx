import { useEffect, useMemo, useState } from "react";
import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from "../models/Appointment.model";
import "../style/UpdateAppointmentModal.css";

type PersonDto = {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
};

type AvailabilitySlotDto = {
  id: string;
  startTime: string; // ISO
  endTime: string; // ISO
  isBooked: boolean;
  doctorId: string;
};

interface Props {
  appointments: Appointment[]; // radi overlap validacije
  appointmentToEdit: Appointment;
  onClose: () => void;
  onUpdated: (updated: Appointment) => void; // da osvežiš tabelu
}

const getFullName = (p: PersonDto) =>
  (p.fullName && p.fullName.trim()) || `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();

const toYMD = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const typeToNumber = (t: AppointmentType): number => {
  switch (t) {
    case AppointmentType.Consulatation:
      return 0;
    case AppointmentType.FollowUp:
      return 1;
    case AppointmentType.Emergency:
      return 2;
    default:
      return 0;
  }
};

const typeLabel = (t: AppointmentType) => {
  switch (t) {
    case AppointmentType.Consulatation:
      return "Consultation";
    case AppointmentType.FollowUp:
      return "Follow Up";
    case AppointmentType.Emergency:
      return "Emergency";
    default:
      return "Unknown";
  }
};

const statusToNumber = (s: AppointmentStatus): number => {
  switch (s) {
    case AppointmentStatus.Scheduled:
      return 0;
    case AppointmentStatus.Completed:
      return 1;
    case AppointmentStatus.Cancelled:
      return 2;
    default:
      return 0;
  }
};

const UpdateAppointmentModal = ({ appointments, appointmentToEdit, onClose, onUpdated }: Props) => {
  // form state
  const [doctor, setDoctor] = useState("");
  const [patient, setPatient] = useState("");
  const [type, setType] = useState<AppointmentType | "">("");
  const [status, setStatus] = useState<AppointmentStatus>(AppointmentStatus.Scheduled);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  // lookup lists
  const [doctors, setDoctors] = useState<PersonDto[]>([]);
  const [patients, setPatients] = useState<PersonDto[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  // slots
  const [date, setDate] = useState<string>(() => toYMD(new Date()));
  const [slots, setSlots] = useState<AvailabilitySlotDto[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);

  // load doctors + patients
  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const [dRes, pRes] = await Promise.all([fetch("/api/Doctor"), fetch("/api/Patient")]);

        if (!dRes.ok) throw new Error("Unable to load doctors.");
        if (!pRes.ok) throw new Error("Unable to load patients.");

        const d = (await dRes.json()) as PersonDto[];
        const p = (await pRes.json()) as PersonDto[];

        setDoctors(d ?? []);
        setPatients(p ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Loading error.");
      }
    };

    load();
  }, []);

  const doctorNameToId = useMemo(() => {
    const map = new Map<string, string>();
    doctors.forEach((d) => map.set(getFullName(d), d.id));
    return map;
  }, [doctors]);

  const patientNameToId = useMemo(() => {
    const map = new Map<string, string>();
    patients.forEach((p) => map.set(getFullName(p), p.id));
    return map;
  }, [patients]);

  // PREFILL from selected row (when modal opens)
  useEffect(() => {
    setDoctor(appointmentToEdit.doctor);
    setPatient(appointmentToEdit.patient);
    setType(appointmentToEdit.type);
    setStatus(appointmentToEdit.status);
    setNotes(appointmentToEdit.notes ?? "");
    setDate(toYMD(appointmentToEdit.start));

    // set ids (after maps are ready)
    setSelectedDoctorId(doctorNameToId.get(appointmentToEdit.doctor) ?? "");
    setSelectedPatientId(patientNameToId.get(appointmentToEdit.patient) ?? "");

    setError("");
  }, [appointmentToEdit, doctorNameToId, patientNameToId]);

  // load slots whenever doctor+date change
  useEffect(() => {
    const ctrl = new AbortController();

    const loadSlots = async () => {
      setSlots([]);
      setSelectedSlotIds([]);

      if (!selectedDoctorId || !date) return;

      try {
        setSlotsLoading(true);
        setError("");

        const url = `/api/Doctor/available-slots?doctorId=${encodeURIComponent(
          selectedDoctorId
        )}&date=${encodeURIComponent(date)}`;

        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`Unable to load slots: ${res.status}`);

        const data = (await res.json()) as AvailabilitySlotDto[];

        const sorted = (data ?? []).slice().sort((a, b) => {
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });

        setSlots(sorted);

        // auto-select slots that match current appointment start/end
        const start = appointmentToEdit.start.getTime();
        const end = appointmentToEdit.end.getTime();

        const ids = sorted
          .filter((s) => {
            const ss = new Date(s.startTime).getTime();
            const ee = new Date(s.endTime).getTime();
            return ss >= start && ee <= end;
          })
          .map((s) => s.id);

        setSelectedSlotIds(ids);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Unable to load slots.");
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    loadSlots();
    return () => ctrl.abort();
  }, [selectedDoctorId, date, appointmentToEdit]);

  // allow booked slots that belong to this appointment (so they remain selectable)
  const editSlotIds = useMemo(() => {
    const start = appointmentToEdit.start.getTime();
    const end = appointmentToEdit.end.getTime();

    const ids = new Set<string>();
    for (const s of slots) {
      const ss = new Date(s.startTime).getTime();
      const ee = new Date(s.endTime).getTime();
      if (ss >= start && ee <= end) ids.add(s.id);
    }
    return ids;
  }, [appointmentToEdit, slots]);

  const visibleSlots = useMemo(() => {
    return slots.filter((s) => !s.isBooked || editSlotIds.has(s.id));
  }, [slots, editSlotIds]);

  const indexById = useMemo(() => {
    const m = new Map<string, number>();
    visibleSlots.forEach((s, i) => m.set(s.id, i));
    return m;
  }, [visibleSlots]);

  const isContiguousByIndex = (ids: string[]) => {
    const idxs = ids
      .map((id) => indexById.get(id))
      .filter((x): x is number => typeof x === "number")
      .sort((a, b) => a - b);

    if (idxs.length !== ids.length) return false;
    if (idxs.length <= 1) return true;

    for (let i = 1; i < idxs.length; i++) {
      if (idxs[i] !== idxs[i - 1] + 1) return false;
    }
    return true;
  };

  const toggleSlot = (id: string) => {
    setError("");

    setSelectedSlotIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);

      if (prev.length >= 3) {
        setError("You can select up to 3 consecutive slots.");
        return prev;
      }

      const next = [...prev, id];

      if (!isContiguousByIndex(next)) {
        setError("Selected slots must be consecutive.");
        return prev;
      }

      return next;
    });
  };

  const selectedRange = useMemo(() => {
    if (selectedSlotIds.length === 0) return null;

    const sortedIds = [...selectedSlotIds].sort((a, b) => {
      return (indexById.get(a) ?? 0) - (indexById.get(b) ?? 0);
    });

    if (!isContiguousByIndex(sortedIds)) return null;

    const first = visibleSlots.find((s) => s.id === sortedIds[0]);
    const last = visibleSlots.find((s) => s.id === sortedIds[sortedIds.length - 1]);

    if (!first || !last) return null;

    return {
      startTime: first.startTime,
      endTime: last.endTime,
      slotsCount: sortedIds.length,
    };
  }, [selectedSlotIds, indexById, visibleSlots]);

  const handleDoctorChange = (val: string) => {
    const v = val.trim();
    setDoctor(v);
    setSelectedDoctorId(doctorNameToId.get(v) ?? "");
    setSelectedSlotIds([]);
  };

  const handlePatientChange = (val: string) => {
    const v = val.trim();
    setPatient(v);
    setSelectedPatientId(patientNameToId.get(v) ?? "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!doctor || !patient || !type || !notes.trim()) {
      setError("All fields are mandatory.");
      return;
    }

    if (!selectedDoctorId) {
      setError("Please select a doctor from the list.");
      return;
    }

    if (!selectedPatientId) {
      setError("Please select a patient from the list.");
      return;
    }

    if (!date) {
      setError("Please select a date first.");
      return;
    }

    if (!selectedRange) {
      setError("Please select 1 to 3 consecutive free slots.");
      return;
    }

    const newStart = new Date(selectedRange.startTime);
    const newEnd = new Date(selectedRange.endTime);

    // overlap (ignore current appointment id)
    const isOverlapping = appointments.some((a) => {
      if (a.id === appointmentToEdit.id) return false;
      const sameDoctor = a.doctor === doctor;
      return sameDoctor && newStart < a.end && newEnd > a.start;
    });

    if (isOverlapping) {
      setError("The doctor already has an appointment in this time range.");
      return;
    }

    const payload = {
      doctorId: selectedDoctorId,
      patientId: selectedPatientId,
      type: typeToNumber(type),
      startTime: selectedRange.startTime,
      endTime: selectedRange.endTime,
      notes: notes.trim(),
      status: statusToNumber(status),
    };

    try {
      const res = await fetch(`/api/Appointment/${appointmentToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Failed to update appointment (${res.status})`);
      }

      const updated: Appointment = {
        ...appointmentToEdit,
        doctor,
        patient,
        type,
        status,
        notes: payload.notes,
        start: newStart,
        end: newEnd,
      };

      onUpdated(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update appointment.");
    }
  };

  return (
    <div className="modal-overlay fullscreen update-appt">
      <div className="modal fullscreen">
        <div className="modal-header">
          <h3>Update Appointment</h3>
          <button type="button" className="icon-btn" onClick={onClose} title="Close">
            ✖
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form fullscreen-grid">
          <div className="field">
            <label>Doctor</label>
            <input
              list="doctors-list-update"
              value={doctor}
              onChange={(e) => handleDoctorChange(e.target.value)}
              placeholder="Start typing doctor's name..."
            />
            <datalist id="doctors-list-update">
              {doctors.map((d) => {
                const name = getFullName(d);
                return <option key={d.id} value={name} />;
              })}
            </datalist>
            {!selectedDoctorId && doctor && (
              <small className="hint">Please select a doctor from the suggestions.</small>
            )}
          </div>

          <div className="field">
            <label>Patient</label>
            <input
              list="patients-list-update"
              value={patient}
              onChange={(e) => handlePatientChange(e.target.value)}
              placeholder="Start typing patient's name..."
            />
            <datalist id="patients-list-update">
              {patients.map((p) => {
                const name = getFullName(p);
                return <option key={p.id} value={name} />;
              })}
            </datalist>
            {!selectedPatientId && patient && (
              <small className="hint">Please select a patient from the suggestions.</small>
            )}
          </div>

          <div className="field">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <small className="hint">Select a date to load available slots.</small>
          </div>

          <div className="field">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as AppointmentType | "")}>
              <option value="">Select type</option>
              <option value={AppointmentType.Consulatation}>
                {typeLabel(AppointmentType.Consulatation)}
              </option>
              <option value={AppointmentType.FollowUp}>{typeLabel(AppointmentType.FollowUp)}</option>
              <option value={AppointmentType.Emergency}>{typeLabel(AppointmentType.Emergency)}</option>
            </select>
          </div>

          <div className="field">
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
            >
              <option value={AppointmentStatus.Scheduled}>Scheduled</option>
              <option value={AppointmentStatus.Completed}>Completed</option>
              <option value={AppointmentStatus.Cancelled}>Cancelled</option>
            </select>
          </div>

          <div className="field slots">
            <label>Available slots</label>

            {!selectedDoctorId || !date ? (
              <div className="slots-empty">Select a doctor and a date to show available slots.</div>
            ) : slotsLoading ? (
              <div className="slots-empty">Loading slots...</div>
            ) : visibleSlots.length === 0 ? (
              <div className="slots-empty">No available slots for the selected day.</div>
            ) : (
              <>
                <div className="slots-grid">
                  {visibleSlots.map((s) => {
                    const start = new Date(s.startTime);
                    const end = new Date(s.endTime);

                    const label = `${start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}-${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

                    const isSelected = selectedSlotIds.includes(s.id);

                    return (
                      <button
                        type="button"
                        key={s.id}
                        className={`slot-btn ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleSlot(s.id)}
                        title="Select up to 3 consecutive slots"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <small className="hint">You can select up to 3 consecutive slots.</small>
              </>
            )}

            {selectedRange && (
              <div className="slots-picked">
                <b>Selected:</b>{" "}
                {new Date(selectedRange.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" - "}
                {new Date(selectedRange.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                <span className="hint">
                  ({selectedRange.slotsCount} slot{selectedRange.slotsCount === 1 ? "" : "s"})
                </span>
              </div>
            )}
          </div>

          <div className="field notes">
            <label>Notes</label>
            <textarea placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="secondary-btn">
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAppointmentModal;

