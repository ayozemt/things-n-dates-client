import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import User from '../interfaces/User';
import { environment } from '../../environments/environment.prod';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiUrl + '/auth';

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  verifyToken(): Observable<any> {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      console.log('No estás autenticado');
      return of(null);
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`, // Include the token in the Authorization header
      }),
    };

    return this.http.get<any>(`${this.baseUrl}/verify`, httpOptions).pipe(
      map((user: any) => {
        // Si se recibe un usuario, significa que el token es válido y el usuario está autenticado
        return user;
      }),
      catchError((error: any) => {
        // Si hay un error al verificar el token, borra el token almacenado
        console.error('Session expired: ', error);
        this.snackBar.open('Session expired. Log in again.', 'Close', {
          duration: 5000,
          verticalPosition: 'top',
        });
        this.removeToken();
        this.router.navigate(['/login']);
        return of(null);
      })
    );
  }

  storeToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  removeToken(): void {
    localStorage.removeItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }
}
