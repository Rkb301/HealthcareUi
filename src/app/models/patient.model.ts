export interface Patient {
  patientID?: number;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  contactNumber?: string;
  address?: string;
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
}

export interface PatientCreate {
  patientID?: number;
  userID?: number;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  contactNumber?: string;
  address?: string;
  medicalHistory?: string;
  currentMedications?: string;
  allergies?: string;
  createdAt?: string;
  modifiedAt?: string;
  isActive?: boolean;

  toString(patient: PatientCreate): string;
}
