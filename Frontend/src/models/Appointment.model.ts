export interface Appointment {
  id: string;                
  doctor: string;            
  patient: string;           
  type: AppointmentType;              
  status: AppointmentStatus; 
  start: Date;
  end: Date;
  notes: string;
}

export interface CreateAppointmentDto {
  doctorId: string; 
  patientId: string; 
  type: number;       
  startTime: string;  
  endTime: string;    
  notes: string;
}

export enum AppointmentStatus {
  Scheduled = "Scheduled",
  Completed = "Completed",
  Cancelled = "Canceled",
}

export enum AppointmentType {
  Consulatation = "Consulatation",
  FollowUp = "FollowUp",
  Emergency = "Emergency"
}