import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, firstValueFrom } from 'rxjs';
import User from '../interfaces/User';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = environment.apiUrl + '/auth';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  async signup(user: User): Promise<User> {
    try {
      const signedUpUser = await firstValueFrom(
        this.http.post<User>(`${this.baseUrl}/signup`, user, this.httpOptions)
      );
      return signedUpUser;
    } catch (error) {
      this.handleError('signup', error);
      throw error;
    }
  }

  async login(credentials: { email: string; password: string }): Promise<void> {
    try {
      const loggedInUser = await firstValueFrom(
        this.http.post<{ authToken: string }>(
          `${this.baseUrl}/login`,
          credentials
        )
      );
      if (loggedInUser) {
        localStorage.setItem('authToken', loggedInUser.authToken);
      } else {
        throw new Error('No se recibió un token de autenticación');
      }
    } catch (error) {
      this.handleError('login', error);
      throw error;
    }
  }

  async verifyToken(): Promise<User> {
    try {
      const verifiedUser = await firstValueFrom(
        this.http.get<User>(`${this.baseUrl}/verify`, this.httpOptions)
      );
      return verifiedUser;
    } catch (error) {
      this.handleError('verifyToken', error);
      throw error;
    }
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      if (error.error instanceof ErrorEvent) {
        console.error('An error occurred:', error.error.message);
      } else {
        console.error(
          `Server returned code ${error.status}, ` + `body was: ${error.error}`
        );
      }
      return of(result as T);
    };
  }
}
