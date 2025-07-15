export interface CurrentAppointmentsDTO {
  // Appointment identifiers
  appointmentID: number;
  patientID: number;
  doctorID: number;

  // Appointment details
  date: string;            // ISO date string
  reason?: string;
  status?: string;
  notes?: string;

  // Patient details
  patientName: string;
  dob: string;             // ISO date string (YYYY-MM-DD)
  gender: string;
  contact: string;
  medicalHistory: string;
  allergies: string;
  currentMedications: string;
}
