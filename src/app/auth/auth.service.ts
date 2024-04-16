import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:5005/auth';

  constructor(private http: HttpClient) {}

  verifyToken(): Observable<any> {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      console.log('No estás autenticado');
      return of({ authenticated: false });
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`, // Include the token in the Authorization header
      }),
    };

    return this.http.get<any>(`${this.baseUrl}/verify`, httpOptions).pipe(
      catchError((_error) => {
        return of({ authenticated: false });
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
