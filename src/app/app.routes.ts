import { DoctorHome } from './components/doctor-home/doctor-home';
import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { PageNotFound } from './components/page-not-found/page-not-found';
import { App } from './app';
import { Dashboard } from './components/dashboard/dashboard';
import { PatientTable } from './components/patient-table/patient-table';
import { Home } from './components/home/home';
import { PatientHome } from './components/patient-home/patient-home';
import { BookAppointmentDialog } from './components/book-appointment-dialog/book-appointment-dialog';
import { AuthGuard } from './services/auth-guard';
import { unauthorizedGuard } from './services/unauthorized-guard';
import { DoctorTable } from './components/doctor-table/doctor-table';
import { AppointmentTable } from './components/appointment-table/appointment-table';


export const routes: Routes = [
  {path: "", redirectTo: "/login", pathMatch: "full"},
  {path: "doctor", component: DoctorHome, canActivate: [AuthGuard], canDeactivate: [unauthorizedGuard]},
  {path: "patient", component: PatientHome, canActivate: [AuthGuard], canDeactivate: [unauthorizedGuard]},
  {path: "book-appointment", component: BookAppointmentDialog, canActivate: [AuthGuard], canDeactivate: [unauthorizedGuard]},
  {path: "patients-all", component: PatientTable, canActivate: [AuthGuard], canDeactivate: [unauthorizedGuard]},
  {path: "doctors-all", component: DoctorTable, canActivate: [AuthGuard], canDeactivate: [unauthorizedGuard]},
  {path: "appointments-all", component: AppointmentTable, canActivate: [AuthGuard], canDeactivate: [unauthorizedGuard]},
  {path: "dashboard", component: Dashboard, canActivate: [AuthGuard], canDeactivate: [unauthorizedGuard]},
  {path: "login", component: Login},
  {path: "**", component: PageNotFound}
];
