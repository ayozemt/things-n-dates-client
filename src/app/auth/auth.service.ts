import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:5005/auth';

  constructor(private http: HttpClient) {}

  verifyToken(): Observable<any> {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      throw new Error('No auth token found');
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`, // Include the token in the Authorization header
      }),
    };

    return this.http.get<any>(`${this.baseUrl}/verify`, httpOptions);
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
