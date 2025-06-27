// src/app/services/patient.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PatientResponse {
  data: Patient[];
  totalCount: number;
}

export interface Patient {
  patientID: number;
  userID: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  contactNumber: string;
  address: string;
  medicalHistory: string;
  allergies: string;
  currentMedications: string;
  createdAt: string;
  modifiedAt: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class PatientService {
  private apiUrl = 'http://localhost:5122/api/patient/search';

  constructor(private http: HttpClient) { }

  getPatients(
    sortFields: string[],
    order: 'asc' | 'desc',
    page: number,
    pageSize: number
  ): Observable<PatientResponse> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString())
      .set('Order', order);

    sortFields.forEach(field => {
      params = params.append('Sort', field);
    });

    return this.http.get<PatientResponse>(this.apiUrl, { params });
  }

  deletePatient(patientID: number): Observable<any> {
    return this.http.delete(`http://localhost:5122/api/patient/${patientID}`);
  }

  getPatientById(patientID: number): Observable<Patient> {
    return this.http.get<Patient>(`http://localhost:5122/api/patient/${patientID}`);
  }

  updatePatient(patientID: number, patient: Partial<Patient>): Observable<Patient> {
    return this.http.put<Patient>(`http://localhost:5122/api/patient/${patientID}`, patient);
  }
}
