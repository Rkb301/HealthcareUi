export interface AppointmentWithNamesDTO {
  appointmentID: number;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  reason?: string;
  status?: string;
  notes?: string;
}
