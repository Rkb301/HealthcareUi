import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Admin } from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminDetailsService {
  private userSubject = new BehaviorSubject<Admin | null>(null);

  // publicly exposed observable for other parts of the app
  public user$: Observable<Admin | null> = this.userSubject.asObservable();

  constructor() {}

  setUser(details: Admin): void {
    this.userSubject.next(details);
  }

  clearUser(): void {
    this.userSubject.next(null);
  }

  get currentUser(): Admin | null {
    return this.userSubject.value;
  }

  get currentAdminId(): number | null {
    return this.userSubject.value?.userID ?? null;
  }
}
