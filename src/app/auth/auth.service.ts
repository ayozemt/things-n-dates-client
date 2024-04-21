import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import User from '../interfaces/User';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:5005/auth';

  constructor(private http: HttpClient) {}

  verifyToken(): Observable<boolean> {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      console.log('No estás autenticado');
      return of(false);
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`, // Include the token in the Authorization header
      }),
    };

    return this.http.get<User>(`${this.baseUrl}/verify`, httpOptions).pipe(
      map((user: User) => {
        // Si se recibe un usuario, significa que el token es válido y el usuario está autenticado
        return !!user;
      }),
      catchError((_error) => {
        // Si hay un error al verificar el token, borra el token almacenado
        this.removeToken();
        return of(false);
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
