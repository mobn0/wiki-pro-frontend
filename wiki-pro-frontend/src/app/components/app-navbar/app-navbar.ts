import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AppAuthService } from '../../service/app.auth.service';
import { AppRoles } from '../../app.roles';

@Component({
  selector: 'app-navbar',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './app-navbar.html',
  styleUrl: './app-navbar.css',
})
export class AppNavbar {
  private authService = inject(AppAuthService);

  protected get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  protected get canManageCategories(): boolean {
    return this.authService.hasRole(AppRoles.Admin);
  }

  protected logout(): void {
    this.authService.logout();
  }
}
