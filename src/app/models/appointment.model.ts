export interface Appointment {
  appointmentID: number;
  patientID: number;
  doctorID: number;
  appointmentDate: string;
  reason?: string;
  status?: string;
  notes?: string;
}

export interface AppointmentWithNamesDTO {
  appointmentID: number;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  reason?: string;
  status?: string;
  notes?: string;
}
