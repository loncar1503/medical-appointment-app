import { useEffect, useMemo, useState } from "react";
import "../style/CreatePatientModal.css";

export interface CreatePatientDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface Props {
  open: boolean;
  creating?: boolean;
  onClose: () => void;
  onCreate: (dto: CreatePatientDTO) => Promise<void> | void;
}

export function CreatePatientModal({
  open,
  creating = false,
  onClose,
  onCreate,
}: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setError(null);
  }, [open]);

  const canSubmit = useMemo(() => {
    return (
      firstName.trim() &&
      lastName.trim() &&
      email.trim() &&
      phone.trim() &&
      !creating
    );
  }, [firstName, lastName, email, phone, creating]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (firstName.length > 20 || lastName.length > 20) {
      setError("First name and last name can have at most 20 characters.");
      return;
    }

    const phoneRegex = /^(?:\+3816\d{7,8}|06\d{7,8})$/;
    if (!phoneRegex.test(phone)) {
      setError("Invalid Serbian phone number.");
      return;
    }

    try {
      await onCreate({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
    } catch {
      setError("Failed to create patient.");
    }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Create Patient</h3>
          <button className="icon-btn" onClick={onClose} type="button">✕</button>
        </div>

        <form className="modal-form" onSubmit={submit}>
          <div className="field-row">
            <div className="field">
              <label>First name</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={20}
                placeholder="First name"
              />
            </div>

            <div className="field">
              <label>Last name</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={20}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="field">
            <label>Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+3816XXXXXXX or 06XXXXXXX"
            />
          </div>

          {error && <div className="error">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
              disabled={creating}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
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
