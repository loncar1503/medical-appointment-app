import { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import AppFooter from "./AppFooter";
import AppointmentHeader from "./AppointmentHeader";
import { CreatePatientModal, CreatePatientDTO } from "./CreatePatientModal";
import PatientHistoryModal from "./PatientHistoryModal";
import "../style/PatientsPage.css";
import "../style/Buttons.css";
import Emergency from "./Emergency";

type ReturnPatientDTO = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  medicalId: string;
  fullName?: string;
};

type PatientRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  medicalId: string;
};

const fullNameOf = (p: ReturnPatientDTO) => {
  const fn = (p.fullName ?? "").trim();
  return fn || `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();
};

const mapPatient = (p: ReturnPatientDTO): PatientRow => ({
  id: p.id,
  fullName: fullNameOf(p),
  email: p.email ?? "",
  phone: p.phone ?? "",
  medicalId: p.medicalId,
});

const PatientsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openEmergency, setOpenEmergency] = useState(false);
  const [all, setAll] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // history modal state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyPatientId, setHistoryPatientId] = useState<string | null>(null);
  const [historyPatientName, setHistoryPatientName] = useState<string>("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/Patient");
      if (!res.ok) throw new Error(`Patients error: ${res.status}`);

      const dto = (await res.json()) as ReturnPatientDTO[];
      const mapped = (dto ?? []).map(mapPatient);
      setAll(mapped);
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
      (p) =>
        p.fullName.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term) ||
        p.phone.toLowerCase().includes(term) ||
        p.medicalId.toLowerCase().includes(term)
    );
  }, [all, q]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const handleCreate = async (dto: CreatePatientDTO) => {
    try {
      setCreating(true);
      setError("");

      const res = await fetch("/api/Patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });

      if (!res.ok) throw new Error("Create failed");

      setIsCreateOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const openHistory = (p: PatientRow) => {
    setHistoryPatientId(p.id);
    setHistoryPatientName(p.fullName);
    setHistoryOpen(true);
  };

  const closeHistory = () => {
    setHistoryOpen(false);
    setHistoryPatientId(null);
    setHistoryPatientName("");
  };

  const handleExport = () => {
  window.location.href = "/api/Patient/export";
  };


  const handleDelete = async (id: string, e: React.MouseEvent) => {
  e.stopPropagation();
  if (!window.confirm("Are you sure you want to delete this patient?")) return;
  try {
    const res = await fetch(`/api/Patient/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    setAll((prev) => prev.filter((p) => p.id !== id));
  } catch {
    alert("Error while deleting patient.");
  }
};
  return (
    <div className="patients-page">
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
        title="PATIENTS"
        subtitle="Overview & creation"
      />

      {/* Toolbar */}
      <div className="patients-toolbar">
        <div className="patients-toolbar__left">
          <div className="patients-search">
            <span className="patients-search__icon">🔍</span>
            <input
              className="patients-search__input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, email, phone or medical ID"
            />
          </div>

          <div className="patients-pagesize">
            <span className="patients-pagesize__label">Page size</span>
            <select
              className="patients-pagesize__select"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <span className="patients-count">
            {q.trim() ? `Found ${total}` : `Total ${all.length}`}
          </span>
        </div>

        

         <div style={{ display: "flex", gap: "8px" }}>
        <button
          className="patients-export-btn"
          onClick={handleExport}
        >
          ⬇ Export CSV
        </button>
        <button className="patients-add-btn" onClick={() => setIsCreateOpen(true)}>
          + Add new patient
        </button>
      </div>
      </div>

      {/* Pagination */}
      <div className="patients-pagination">
        <button
          className="patients-pagination__btn"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={loading || safePage <= 1}
        >
          ← Prev
        </button>

        <span className="patients-pagination__info">
          Page {safePage} / {pageCount}
        </span>

        <button
          className="patients-pagination__btn"
          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          disabled={loading || safePage >= pageCount}
        >
          Next →
        </button>
      </div>

      <div style={{ flex: 1 }}>
        {loading && <div className="patients-loading">Loading patients...</div>}
        {!loading && error && <div className="patients-error">{error}</div>}

      {/* Table */}
      {!loading && !error && (
        <div className="patients-table-card">
          <table className="patients-table">
            <thead>
              <tr>
                <th>Full name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Medical ID</th>
                <th>Actions</th> 
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr className="patients-empty-row">
                  <td colSpan={4}>No patients found.</td>
                </tr>
              ) : (
                pageRows.map((p) => (
                  <tr
                    key={p.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => openHistory(p)}
                    title="Click to view appointment history"
                  >
                    <td>{p.fullName || "-"}</td>
                    <td>{p.email || "-"}</td>
                    <td>{p.phone || "-"}</td>
                    <td>{p.medicalId}</td>
                    <td>
                   <button
                        className="icon-btn danger"
                        onClick={(e) => handleDelete(p.id, e)}
                        title="Delete patient"
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
        <CreatePatientModal
          open={isCreateOpen}
          creating={creating}
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreate}
        />
      )}

      <PatientHistoryModal
        open={historyOpen}
        patientId={historyPatientId}
        patientName={historyPatientName}
        onClose={closeHistory}
      />

      <AppFooter />
    </div>
  );
};

export default PatientsPage;