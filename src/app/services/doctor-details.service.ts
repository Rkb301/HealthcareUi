import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Doctor } from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorDetailsService {
  private userSubject = new BehaviorSubject<Doctor | null>(null);

  // publicly exposed observable for other parts of the app
  public user$: Observable<Doctor | null> = this.userSubject.asObservable();

  constructor() {}

  setUser(details: Doctor): void {
    this.userSubject.next(details);
  }

  clearUser(): void {
    this.userSubject.next(null);
  }

  get currentUser(): Doctor | null {
    return this.userSubject.value;
  }

  get currentDoctorId(): number | null {
    return this.userSubject.value?.doctorID ?? null;
  }
}
