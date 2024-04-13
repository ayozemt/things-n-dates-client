import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-auth-provider',
  template: '<ng-content></ng-content>',
})
export class AuthProviderComponent implements OnInit {
  private subscription: Subscription | undefined;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Verificar la autenticación al iniciar la aplicación
    this.subscription = this.authService.verifyToken().subscribe({
      next: () => {},
      error: () => {
        // En caso de error al verificar el token, eliminar el token y establecer el estado de autenticación en falso
        this.authService.removeToken();
      },
    });
  }

  ngOnDestroy(): void {
    // Asegúrate de desuscribirte cuando el componente se destruya
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
