import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import AppFooter from "./AppFooter";
import AppointmentHeader from "./AppointmentHeader";
import {
  CreateDoctorModal,
  CreateDoctorDTO,
  Specialization,
} from "./CreateDoctorModal";
import "../style/DoctorsPage.css";
import "../style/Buttons.css";
import Emergency from "./Emergency";


type ReturnDoctorDTO = {
  id: string;
  firstName: string;
  lastName: string;
  specialization: unknown;
  email?: string | null;
  phone?: string | null;
  fullName?: string;
};

type DoctorRow = {
  id: string;
  fullName: string;
  specialization: string;
  email: string;
  phone: string;
};

const specializationLabel = (s: Specialization) => {
  switch (s) {
    case Specialization.GeneralPractitioner:
      return "General practitioner";
    case Specialization.Dentist:
      return "Dentist";
    case Specialization.Surgeon:
      return "Surgeon";
    default:
      return "Unknown";
  }
};

const normalizeSpecialization = (raw: unknown): Specialization | null => {
  if (raw === null || raw === undefined) return null;

  if (typeof raw === "number") {
    if (raw === 0 || raw === 1 || raw === 2) return raw as Specialization;
    return null;
  }

  if (typeof raw === "string") {
    const t = raw.trim();

    if (t === "0" || t === "1" || t === "2") return Number(t) as Specialization;

    const k = t.toLowerCase();

    if (k === "generalpracticioner" || k === "general practicioner")
      return Specialization.GeneralPractitioner;

    if (k === "generalpractitioner" || k === "general practitioner")
      return Specialization.GeneralPractitioner;

    if (k === "dentist") return Specialization.Dentist;
    if (k === "surgeon") return Specialization.Surgeon;

    return null;
  }

  if (typeof raw === "object") {
    const obj = raw as any;

    const id = obj?.id ?? obj?.value ?? obj?.specializationId;
    if (id !== undefined) return normalizeSpecialization(id);

    const name = obj?.name ?? obj?.label ?? obj?.specialization;
    if (typeof name === "string") return normalizeSpecialization(name);

    return null;
  }

  return null;
};

const specializationText = (raw: unknown) => {
  const norm = normalizeSpecialization(raw);
  return norm === null ? "Unknown" : specializationLabel(norm);
};

const fullNameOf = (d: ReturnDoctorDTO) => {
  const fn = (d.fullName ?? "").trim();
  return fn || `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim();
};

const mapDoctor = (d: ReturnDoctorDTO): DoctorRow => ({
  id: d.id,
  fullName: fullNameOf(d),
  specialization: specializationText(d.specialization),
  email: d.email ?? "",
  phone: d.phone ?? "",
});

const DoctorsPage = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openEmergency, setOpenEmergency] = useState(false);
  const [all, setAll] = useState<DoctorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/Doctor");
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Doctors error (${res.status})`);
      }

      const dto = (await res.json()) as ReturnDoctorDTO[];
      setAll((dto ?? []).map(mapDoctor));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
      setAll([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [q, pageSize]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return all;

    return all.filter(
      (d) =>
        d.fullName.toLowerCase().includes(term) ||
        d.email.toLowerCase().includes(term) ||
        d.phone.toLowerCase().includes(term) ||
        d.specialization.toLowerCase().includes(term)
    );
  }, [all, q]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const handleCreate = async (dto: CreateDoctorDTO) => {
    try {
      setCreating(true);
      setError("");

      const res = await fetch("/api/Doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Create failed (${res.status})`);
      }

      setIsCreateOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

    const handleExport = () => {
      window.location.href = "/api/Doctor/export";
    };

const handleDelete = async (id: string) => {
  if (!window.confirm("Are you sure you want to delete this doctor?")) return;
  try {
    const res = await fetch(`/api/Doctor/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    setAll((prev) => prev.filter((d) => d.id !== id));
  } catch {
    alert("Error while deleting doctor.");
  }
};


  return (
    <div className="doctors-page">
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
        title="DOCTORS"
        subtitle="Overview & creation"
      />

      {/* Toolbar */}
      <div className="doctors-toolbar">
        <div className="doctors-toolbar__left">
          <div className="doctors-search">
            <span className="doctors-search__icon">🔍</span>
            <input
              className="doctors-search__input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, email, phone or specialization"
            />
          </div>

          <div className="doctors-pagesize">
            <span className="doctors-pagesize__label">Page size</span>
            <select
              className="doctors-pagesize__select"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <span className="doctors-count">
            {q.trim() ? `Found ${total}` : `Total ${all.length}`}
          </span>
        </div>
            
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          className="doctors-export-btn"
          onClick={handleExport}
        >
          ⬇ Export CSV
        </button>
        <button
          className="doctors-add-btn"
          onClick={() => setIsCreateOpen(true)}
        >
          + Add new doctor
        </button>
      </div>
      
      </div>

      {/* Pagination */}
      <div className="doctors-pagination">
        <button
          className="doctors-pagination__btn"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={loading || safePage <= 1}
        >
          ← Prev
        </button>

        <span className="doctors-pagination__info">
          Page {safePage} / {pageCount}
        </span>

        <button
          className="doctors-pagination__btn"
          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          disabled={loading || safePage >= pageCount}
        >
          Next →
        </button>
      </div>

    
      {/* Table */}
      <div style={{ flex: 1 }}>
      {loading && <div className="doctors-loading">Loading doctors...</div>}
      {!loading && error && <div className="doctors-error">{error}</div>}

      {!loading && !error && (
        <div className="doctors-table-card">
          <table className="doctors-table">
            <thead>
              <tr>
                <th>Full name</th>
                <th>Specialization</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr className="doctors-empty-row">
                  <td colSpan={4}>No doctors found.</td>
                </tr>
              ) : (
                pageRows.map((d) => (
                  <tr key={d.id}>
                    <td>{d.fullName || "-"}</td>
                    <td>{d.specialization}</td>
                    <td>{d.email || "-"}</td>
                    <td>{d.phone || "-"}</td>
                     <td>
                      <button
                        className="icon-btn danger"
                        onClick={() => handleDelete(d.id)}
                        title="Delete doctor"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
  </div>
  
      {isCreateOpen && (
        <CreateDoctorModal
          open={isCreateOpen}
          creating={creating}
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreate}
        />
      )}

      <AppFooter />
    </div>
  );
};

export default DoctorsPage;

