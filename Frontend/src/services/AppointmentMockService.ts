import { Appointment, AppointmentStatus } from "../models/Appointment.model";

export const events: Appointment[] = [
  {
    id: 1,
    doctor: "Dr Marković",
    patient: "Petar Petrović",
    type: "Pregled",
    status:AppointmentStatus.Completed,
    start: new Date("2026-02-25T13:00"),
    end: new Date("2026-02-25T14:00"),
    notes: "neka napomena",
  },
  {
    id: 3,
    doctor: "Dr Jovanović",
    patient: "Janko Janković",
    type: "Kontrola",
    status:AppointmentStatus.Completed,
    start: new Date("2026-02-24T16:00"),
    end: new Date("2026-02-24T17:00"),
    notes: "neka napomena",
  },
  {
    id: 4,
    doctor: "Dr Jovanović",
    patient: "Marko Marković",
    type: "Kontrola",
    status:AppointmentStatus.Scheduled,
    start: new Date("2026-02-28T16:00"),
    end: new Date("2026-02-28T17:00"),
    notes: "neka napomena",
  },
  {
    id: 5,
    doctor: "Dr Jovanović",
    patient: "Milos Milosević",
    type: "Kontrola",
    status:AppointmentStatus.Cancelled,
    start: new Date("2026-02-24T13:00"),
    end: new Date("2026-02-24T14:00"),
    notes: "neka napomena",
  },
  {
    id: 6,
    
    doctor: "Dr Jovanović",
    patient: "Ivan Ivanović",
    type: "Konsultacija",
    status:AppointmentStatus.Completed,
    start: new Date("2026-02-23T12:00"),
    end: new Date("2026-02-23T13:00"),
    notes: "neka napomena",
  },
];

