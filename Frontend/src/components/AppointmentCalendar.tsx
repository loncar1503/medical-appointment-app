import { useState } from "react";
import { Appointment, AppointmentStatus } from "../models/Appointment.model";
import "../style/Calendar.css";
import "../style/Badges.css";
import "../style/Buttons.css";

type Props = {
  appointments: Appointment[];
  onEdit: (a: Appointment) => void;
  onDelete: (id: string) => void;
};

type PopupState = {
  appointment: Appointment;
  x: number;
  y: number;
} | null;

const getStatusClass = (status: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.Scheduled: return "status-scheduled";
    case AppointmentStatus.Completed: return "status-completed";
    case AppointmentStatus.Cancelled: return "status-cancelled";
    default: return "";
  }
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const AppointmentCalendar = ({ appointments, onEdit, onDelete }: Props) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [popup, setPopup] = useState<PopupState>(null);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  const prevMonth = () => {
    setExpandedDays(new Set());
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    setExpandedDays(new Set());
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const toggleExpand = (e: React.MouseEvent, day: number) => {
    e.stopPropagation();
    setExpandedDays((prev) => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  };

  const firstDay = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const appointmentsByDay: Record<number, Appointment[]> = {};
  appointments.forEach((a) => {
    const d = new Date(a.start);
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      const day = d.getDate();
      if (!appointmentsByDay[day]) appointmentsByDay[day] = [];
      appointmentsByDay[day].push(a);
    }
  });

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthName = firstDay.toLocaleString("en-US", { month: "long", year: "numeric" });

const handleAppointmentClick = (e: React.MouseEvent, appt: Appointment) => {
  e.stopPropagation();
  const rect = (e.target as HTMLElement).getBoundingClientRect();

  const popupWidth = 460;
  const popupHeight = 420;
  const margin = 10;

  let x = rect.left;
  let y = rect.bottom + 4;

  if (x + popupWidth > window.innerWidth - margin) {
    x = window.innerWidth - popupWidth - margin;
  }

  if (x < margin) {
    x = margin;
  }

  if (y + popupHeight > window.innerHeight - margin) {
    y = rect.top - popupHeight - 4;
  }

  if (y < margin) {
    y = margin;
  }

  setPopup({ appointment: appt, x, y });
};

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  return (
    <div className="calendar-wrapper" onClick={() => { setPopup(null); }}>
      <div className="calendar-nav">
        <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
        <span className="cal-month-label">{monthName}</span>
        <button className="cal-nav-btn" onClick={nextMonth}>›</button>
      </div>

      <div className="calendar-grid">
        {DAYS.map((d) => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}

        {cells.map((day, i) => {
          const dayAppts = day !== null ? (appointmentsByDay[day] ?? []) : [];
          const isExpanded = day !== null && expandedDays.has(day);
          const visibleAppts = isExpanded ? dayAppts : dayAppts.slice(0, 3);
          const hiddenCount = dayAppts.length - 3;

          return (
            <div
              key={i}
              className={`cal-cell ${day === null ? "cal-cell--empty" : ""} ${day && isToday(day) ? "cal-cell--today" : ""} ${isExpanded ? "cal-cell--expanded" : ""}`}
            >
              {day !== null && (
                <>
                  <span className="cal-day-number">{day}</span>
                  <div className="cal-events">
                    {visibleAppts.map((appt) => (
                      <div
                        key={appt.id}
                        className={`cal-event-chip ${getStatusClass(appt.status)}`}
                        onClick={(e) => handleAppointmentClick(e, appt)}
                        title={`${appt.patient} - ${appt.doctor}`}
                      >
                        {new Date(appt.start).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })} {appt.patient}
                      </div>
                    ))}

                    {!isExpanded && hiddenCount > 0 && (
                      <button
                        className="cal-event-more-btn"
                        onClick={(e) => toggleExpand(e, day)}
                      >
                        +{hiddenCount} more
                      </button>
                    )}

                    {isExpanded && (
                      <button
                        className="cal-event-more-btn cal-event-more-btn--collapse"
                        onClick={(e) => toggleExpand(e, day)}
                      >
                        ↑ Show less
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

     {popup && (
      <div
        className={`cal-popup ${getStatusClass(popup.appointment.status)}`}
        style={{ top: popup.y, left: popup.x }}
        onClick={(e) => e.stopPropagation()}
      >
          <div className="cal-popup-header">
            <span className={`status-badge ${getStatusClass(popup.appointment.status)}`}>
              {popup.appointment.status}
            </span>
            <button className="cal-popup-close" onClick={() => setPopup(null)}>✕</button>
          </div>
          <div className="cal-popup-body">
            <p><strong>Patient:</strong> {popup.appointment.patient}</p>
            <p><strong>Doctor:</strong> {popup.appointment.doctor}</p>
            <p><strong>Type:</strong> {popup.appointment.type}</p>
            <p><strong>Start:</strong> {new Date(popup.appointment.start).toLocaleString("en-US")}</p>
            <p><strong>End:</strong> {new Date(popup.appointment.end).toLocaleString("en-US")}</p>
            {popup.appointment.notes && <p><strong>Notes:</strong> {popup.appointment.notes}</p>}
          </div>
          <div className="cal-popup-actions">
            <button className="icon-btn" onClick={() => { onEdit(popup.appointment); setPopup(null); }}>✏️ Edit</button>
            <button className="icon-btn danger" onClick={() => { onDelete(popup.appointment.id); setPopup(null); }}>🗑️ Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;