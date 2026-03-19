import { useEffect, useMemo, useState } from "react";
import "../style/CreateDoctorModal.css";

export enum Specialization {
  GeneralPractitioner = 0,
  Dentist = 1,
  Surgeon = 2,
}

export interface CreateDoctorDTO {
  firstName: string;
  lastName: string;
  email: string; 
  specialization: Specialization;
  phone: string;
}

interface Props {
  open: boolean;
  creating?: boolean;
  onClose: () => void;
  onCreate: (dto: CreateDoctorDTO) => Promise<void> | void;
}

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

export function CreateDoctorModal({
  open,
  creating = false,
  onClose,
  onCreate,
}: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(""); 
  const [specialization, setSpecialization] = useState<Specialization | "">("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFirstName("");
    setLastName("");
    setEmail("");
    setSpecialization("");
    setPhone("");
    setError(null);
  }, [open]);

  const canSubmit = useMemo(() => {
    return (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      email.trim().length > 0 &&
      specialization !== "" &&
      phone.trim().length > 0 &&
      !creating
    );
  }, [firstName, lastName, email, specialization, phone, creating]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim();
    const ph = phone.trim();

    if (fn.length > 120 || ln.length > 120) {
      setError("First name and last name can have at most 120 characters.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(em)) {
      setError("Invalid email address.");
      return;
    }

    if (specialization === "") {
      setError("Specialization is required.");
      return;
    }

    if (ph.length > 40) {
      setError("Phone can have at most 40 characters.");
      return;
    }

    const phoneRegex = /^(?:\+3816\d{7,8}|06\d{7,8})$/;
    if (!phoneRegex.test(ph)) {
      setError("Invalid Serbian phone number. Use +3816XXXXXXX or 06XXXXXXX.");
      return;
    }

    try {
      await onCreate({
        firstName: fn,
        lastName: ln,
        email: em,
        specialization: specialization as Specialization,
        phone: ph,
      });
    } catch {
      setError("Failed to create doctor.");
    }
  }

  if (!open) return null;

  return (
    <div className="doctor-modal-overlay" role="dialog" aria-modal="true">
      <div className="doctor-modal">
        <div className="doctor-modal-header">
          <h3>Create Doctor</h3>
          <button
            className="doctor-icon-btn"
            onClick={onClose}
            type="button"
            aria-label="Close"
            disabled={creating}
          >
            ✕
          </button>
        </div>

        <form className="doctor-modal-form" onSubmit={submit}>
          <div className="doctor-field-row">
            <div className="doctor-field">
              <label>First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={120}
                placeholder="First name"
                disabled={creating}
              />
            </div>

            <div className="doctor-field">
              <label>Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={120}
                placeholder="Last name"
                disabled={creating}
              />
            </div>
          </div>

          <div className="doctor-field">
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              disabled={creating}
            />
          </div>

          <div className="doctor-field">
            <label>Specialization</label>
            <select
              value={specialization === "" ? "" : String(specialization)}
              onChange={(e) => {
                const v = e.target.value;
                setSpecialization(v === "" ? "" : (Number(v) as Specialization));
              }}
              disabled={creating}
            >
              <option value="">Select specialization</option>
              <option value={Specialization.GeneralPractitioner}>
                {specializationLabel(Specialization.GeneralPractitioner)}
              </option>
              <option value={Specialization.Dentist}>
                {specializationLabel(Specialization.Dentist)}
              </option>
              <option value={Specialization.Surgeon}>
                {specializationLabel(Specialization.Surgeon)}
              </option>
            </select>
          </div>

          <div className="doctor-field">
            <label>Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={40}
              placeholder="+3816XXXXXXX or 06XXXXXXX"
              disabled={creating}
            />
          </div>

          {error && <div className="doctor-error">{error}</div>}

          <div className="doctor-modal-actions">
            <button
              type="button"
              className="doctor-secondary-btn"
              onClick={onClose}
              disabled={creating}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="doctor-primary-btn"
              disabled={!canSubmit}
            >
              {creating ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



CreateDoctorModal
