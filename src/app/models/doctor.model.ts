export interface Doctor {
  doctorID?: number;
  userID?: string;
  firstName?: string;
  lastName?: string;
  specialization?: string;
  contactNumber?: string;
  email?: string;
  schedule?: string;
}

export interface DoctorCreate {
  doctorID?: number;
  userID?: number;
  firstName?: string;
  lastName?: string;
  specialization?: string;
  contactNumber?: string;
  email?: string;
  schedule?: string;
  createdAt?: string;
  modifiedAt?: string;
  isActive?: boolean;

  toString(doctor: DoctorCreate): string;
}
