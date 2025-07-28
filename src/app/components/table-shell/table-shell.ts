import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-table-shell',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './table-shell.html',
  styleUrl: './table-shell.scss'
})
export class TableShell {
  @Input() title: string = '';
  @Input() canCreate: boolean = true;
  @Output() create = new EventEmitter<void>();

  private router = inject(Router);
  private authService = inject(LoginService);

  openDialog() {
    this.create.emit();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
