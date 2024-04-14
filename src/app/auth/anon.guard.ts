import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AnonGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.authService.isLoggedIn()) {
      return true; // El usuario no está autenticado, permitir acceso a la ruta
    } else {
      // El usuario ya está autenticado, redirigir a la página principal
      this.router.navigate(['/list']);
      return false;
    }
  }
}
