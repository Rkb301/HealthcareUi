import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientDetailsService {
  private userSubject = new BehaviorSubject<Patient | null>(null);

  // publicly exposed observable for other parts of the app
  public user$: Observable<Patient | null> = this.userSubject.asObservable();

  constructor() {}

  setUser(details: Patient): void {
    this.userSubject.next(details);
  }

  clearUser(): void {
    this.userSubject.next(null);
  }

  get currentUser(): Patient | null {
    return this.userSubject.value;
  }

  get currentPatientId(): number | null {
    return this.userSubject.value?.patientID ?? null;
  }
}
