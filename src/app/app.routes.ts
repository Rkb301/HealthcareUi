import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { PageNotFound } from './components/page-not-found/page-not-found';
import { App } from './app';

export const routes: Routes = [
  {path: "login", component: Login},
  {path: "", redirectTo: "/login", pathMatch: "full"},
  {path: "**", component: PageNotFound}
];
