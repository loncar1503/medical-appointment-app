import { AppointmentType } from "../models/Appointment.model";
import "../style/Filters.css";

type AppointmentFiltersProps = {
  doctorOptions: string[];
  patientOptions: string[];
  typeOptions: AppointmentType[];
  selectedDoctor: string;
  selectedPatient: string;
  selectedType: string;
  dateFrom: string;
  dateTo: string;
  onDoctorChange: (v: string) => void;
  onPatientChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onNewAppointment: () => void;
  onDownloadPdf: () => void;
  onExportCsv: () => void;
};

const AppointmentFilters = ({
  doctorOptions,
  patientOptions,
  typeOptions,
  selectedDoctor,
  selectedPatient,
  selectedType,
  dateFrom,
  dateTo,
  onDoctorChange,
  onPatientChange,
  onTypeChange,
  onDateFromChange,
  onDateToChange,
  onNewAppointment,
  onDownloadPdf,
  onExportCsv,
}: AppointmentFiltersProps) => {

  const hasActiveFilters =
    selectedDoctor || selectedPatient || selectedType || dateFrom || dateTo;

  return (
    <div className="filter-bar">

      <div className="filter-bar__label">
        <span className="filter-bar__icon">⚙</span>
        Filters
        {hasActiveFilters && (
          <span className="filter-bar__active-dot" title="Active filters"/>
        )}
      </div>


      <div className="filter-bar__inputs">

        {/* Doctor */}
        <div className={`filter-chip ${selectedDoctor ? "filter-chip--active" : ""}`}>
          <label className="filter-chip__label">
            <span className="filter-chip__label-icon">👨‍⚕️</span>
            Doctor
          </label>

          <select
            className="filter-chip__input"
            value={selectedDoctor}
            onChange={(e) => onDoctorChange(e.target.value)}
          >
            <option value="">All</option>
            {doctorOptions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>


        {/* Type */}
        <div className={`filter-chip ${selectedType ? "filter-chip--active" : ""}`}>
          <label className="filter-chip__label">
            <span className="filter-chip__label-icon">📋</span>
            Type
          </label>

          <select
            className="filter-chip__input"
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
          >
            <option value="">All</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>


        {/* Patient */}
        <div className={`filter-chip ${selectedPatient ? "filter-chip--active" : ""}`}>
          <label className="filter-chip__label">
            <span className="filter-chip__label-icon">🧑</span>
            Patient
          </label>

          <select
            className="filter-chip__input"
            value={selectedPatient}
            onChange={(e) => onPatientChange(e.target.value)}
          >
            <option value="">All</option>
            {patientOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>


        {/* Date From */}
        <div className={`filter-chip ${dateFrom ? "filter-chip--active" : ""}`}>
          <label className="filter-chip__label">
            <span className="filter-chip__label-icon">📅</span>
            From
          </label>

          <input
            className="filter-chip__input"
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
        </div>


        {/* Date To */}
        <div className={`filter-chip ${dateTo ? "filter-chip--active" : ""}`}>
          <label className="filter-chip__label">
            <span className="filter-chip__label-icon">📅</span>
            To
          </label>

          <input
            className="filter-chip__input"
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />
        </div>


        {/* Clear */}
        {hasActiveFilters && (
          <button
            className="filter-clear-btn"
            onClick={() => {
              onDoctorChange("");
              onPatientChange("");
              onTypeChange("");
              onDateFromChange("");
              onDateToChange("");
            }}
          >
            ✕ Clear
          </button>
        )}

      </div>

      <div className="filter-bar__actions">

        <button
          className="header-btn header-btn--export"
          onClick={onExportCsv}
        >
          ⬇ Export CSV
        </button>

        <button
          className="header-btn header-btn--secondary"
          onClick={onDownloadPdf}
        >
          ↓ Download PDF
        </button>

        <button
          className="header-btn header-btn--primary"
          onClick={onNewAppointment}
        >
          + New Appointment
        </button>

      </div>

    </div>
  );
};

export default AppointmentFilters;