import { ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot } from '@angular/router';
import { LoginService } from './login.service';
import { inject } from '@angular/core';
import Swal from 'sweetalert2';

export const unauthorizedGuard: CanDeactivateFn<unknown> = (
  component,
  currentRoute: ActivatedRouteSnapshot,
  currentState: RouterStateSnapshot,
  nextState: RouterStateSnapshot) =>
{
  const loginService = inject(LoginService);
  if (loginService.isLoggedIn()) {
    return true;
  } else {
    Swal.fire('Logged Out', "Successfully logged out", 'success');
    return false;
  }
};
