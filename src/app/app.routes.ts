import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { PageNotFound } from './components/page-not-found/page-not-found';
import { App } from './app';
import { Dashboard } from './components/dashboard/dashboard';
import { PatientTable } from './components/patients/patient-table/patient-table';


export const routes: Routes = [
  {path: "", redirectTo: "/login", pathMatch: "full"},
  {path: "login", component: Login},
  {path: "dashboard", component: Dashboard},
  {path: "patients", component: PatientTable},
  {path: "**", component: PageNotFound}
];
