import { DoctorHome } from './components/doctor-home/doctor-home';
import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { PageNotFound } from './components/page-not-found/page-not-found';
import { App } from './app';
import { Dashboard } from './components/dashboard/dashboard';
import { PatientTable } from './components/patient-table/patient-table';
import { Home } from './components/home/home';


export const routes: Routes = [
  {path: "", redirectTo: "/login", pathMatch: "full"},
  {path: "login", component: Login},
  {path: "doctor", component: DoctorHome}, // TEMPORARY PATH UNTIL HOME SETUP
  {path: "home", component: Home},
  {path: "dashboard", component: Dashboard},
  {path: "patients", component: PatientTable},
  {path: "**", component: PageNotFound}
];
