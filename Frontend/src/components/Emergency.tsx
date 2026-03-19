import { useState } from "react";
import "../style/emergency.css";
type EmergencyProps = {
  open: boolean;
  onClose: () => void;
};

export default function Emergency({ open, onClose }: EmergencyProps) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successText, setSuccessText] = useState("");

  const handleSubmit = async () => {
  if (!description.trim()) return;
  setResultMessage(null);
  setErrorMessage(null);
  try {
    setLoading(true);

    console.log("Sending emergency text:", description);

  const response = await fetch(
    "/api/ai/schedule",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: description }),
    }
  );
    console.log("Status:", response.status);

    const raw = await response.text(); // 👈 pročitaj sve (i success i error)
    console.log("Raw response:", raw);

    let data: any = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      // ako backend ne vrati JSON
    }

   if (!response.ok) {
    console.log("API error payload:", data);
    console.log("Raw length:", raw.length);

    const extractedErrors =
      data?.errors
        ? Object.values(data.errors).flat().join("\n")
        : null;

    const msg =
      (typeof data?.message === "string" && data.message.trim() ? data.message : null) ??
      (typeof data?.title === "string" && data.title.trim() ? data.title : null) ??
      (typeof extractedErrors === "string" && extractedErrors.trim() ? extractedErrors : null) ??
      (typeof raw === "string" && raw.trim() ? raw : null) ??
      `API request failed (${response.status})`;

    setErrorMessage(msg);
    setResultMessage(null);
    return;
  }

    const msg =
      typeof data?.message === "string" && data.message.trim()
        ? data.message
        : "Success";

    setSuccessText(msg);
    setSuccessOpen(true);

    setDescription("");
    setResultMessage(null);
    setErrorMessage(null);

    // zatvori emergency formu
    onClose();
  } catch (error) {
    console.error("Emergency error:", error);
    setErrorMessage("Fetch failed. Check Console/Network.");
    setResultMessage(null);
  } finally {
    setLoading(false);
  }
};

  if (!open && !successOpen) return null;

  return (
      <>
        {/* Emergency form modal */}
        {open && (
          <div className="overlay">
            <div className="modal">
              <h3>🚑 Create Emergency Appointment</h3>

              <textarea
                placeholder="Enter emergency description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              {errorMessage && <div className="error-box">{errorMessage}</div>}

              <div className="buttons">
                <button
                  onClick={() => {
                    setResultMessage(null);
                    setErrorMessage(null);
                    setDescription("");
                    onClose();
                  }}
                >
                  Cancel
                </button>

                <button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Sending..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success popup modal */}
        {successOpen && (
          <div className="overlay">
            <div className="modal success-modal">
              <h3>✅ Scheduled</h3>

              <div className="success-box">{successText}</div>

              <div className="buttons">
                <button
                  onClick={() => {
                    setSuccessOpen(false);
                    setSuccessText("");
                    window.location.reload();
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
}