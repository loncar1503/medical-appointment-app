import { useEffect, useMemo, useState } from "react";
import { AppointmentStatus } from "../models/Appointment.model";
import { AppointmentType } from "../models/Appointment.model";
import "../style/PatientHistoryModal.css";

type PersonDto = {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
};

type ReturnAppointmentDTO = {
  id: string;
  type: AppointmentType;
  status: AppointmentStatus;
  startTime: string;
  endTime: string;
  notes: string;
  doctor: PersonDto;
  patient: PersonDto;
};

type Row = {
  id: string;
  doctor: string;
  type: AppointmentType;
  status: AppointmentStatus;
  start: Date;
  end: Date;
  notes: string;
};

const getFullName = (p?: PersonDto) => {
  if (!p) return "-";
  return (p.fullName && p.fullName.trim()) || `${p.firstName} ${p.lastName}`.trim() || "-";
};

type Props = {
  open: boolean;
  patientId: string | null;
  patientName?: string;
  onClose: () => void;
};

export default function PatientHistoryModal({ open, patientId, patientName, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!open || !patientId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const url =
          `/api/Appointment/filtered` +
          `?patientId=${encodeURIComponent(patientId)}` +
          `&sortBy=startTime` +
          `&sortDesc=true`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`History error: ${res.status}`);

        const dto = (await res.json()) as ReturnAppointmentDTO[];

        const mapped: Row[] = (dto ?? []).map((a) => ({
          id: a.id,
          doctor: getFullName(a.doctor),
          type: a.type,
          status: a.status,
          start: new Date(a.startTime),
          end: new Date(a.endTime),
          notes: a.notes ?? "",
        }));

        setRows(mapped);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Load failed");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, patientId]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => b.start.getTime() - a.start.getTime());
  }, [rows]);

  if (!open) return null;

  return (
    <div className="phm-overlay" onClick={onClose}>
      <div className="phm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="phm-header">
          <div>
            <div className="phm-title">Patient history</div>
            <div className="phm-subtitle">{patientName || ""}</div>
          </div>
          <button className="phm-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="phm-body">
          {loading && <div className="phm-state">Loading...</div>}
          {!loading && error && <div className="phm-error">{error}</div>}

          {!loading && !error && (
            <>
              {sortedRows.length === 0 ? (
                <div className="phm-state">No appointments for this patient.</div>
              ) : (
                <div className="phm-tablewrap">
                  <table className="phm-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Doctor</th>
                        <th>Type</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRows.map((r) => (
                        <tr key={r.id}>
                          <td>{String(r.status)}</td>
                          <td>{r.doctor}</td>
                          <td>{String(r.type)}</td>
                          <td>
                            {r.start.toLocaleDateString()}{" "}
                            {r.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td>
                            {r.end.toLocaleDateString()}{" "}
                            {r.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="phm-notes">{r.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        <div className="phm-footer">
          <button className="phm-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}