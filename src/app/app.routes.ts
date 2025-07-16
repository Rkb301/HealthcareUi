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


export const routes: Routes = [
  {path: "", redirectTo: "/login", pathMatch: "full"},
  {path: "login", component: Login},
  {path: "doctor", component: DoctorHome}, // TEMPORARY PATH UNTIL HOME SETUP
  { path: "patient", component: PatientHome },
  {path: "book-appointment", component: BookAppointmentDialog},
  {path: "home", component: Home},
  {path: "dashboard", component: Dashboard},
  {path: "**", component: PageNotFound}
];
