import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, firstValueFrom } from 'rxjs';
import Thing from '../interfaces/Thing';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class ThingService {
  private baseUrl = environment.apiUrl + '/thing';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  async createThing(thing: Thing): Promise<Thing> {
    try {
      const createdThing = await firstValueFrom(
        this.http.post<Thing>(`${this.baseUrl}`, thing, this.httpOptions)
      );
      return createdThing;
    } catch (error) {
      this.handleError('createThing', error);
      throw error;
    }
  }

  async getAllThings(): Promise<Thing[]> {
    try {
      const things = await firstValueFrom(
        this.http.get<Thing[]>(`${this.baseUrl}/list`, this.httpOptions)
      );
      return things;
    } catch (error) {
      this.handleError('getAllThings', error);
      throw error;
    }
  }

  async getThingById(thingId: string): Promise<Thing> {
    try {
      const thing = await firstValueFrom(
        this.http.get<Thing>(`${this.baseUrl}/${thingId}`, this.httpOptions)
      );
      return thing;
    } catch (error) {
      this.handleError('getThingById', error);
      throw error;
    }
  }

  async getThingsByUserId(userId: string): Promise<Thing[]> {
    try {
      const things = await firstValueFrom(
        this.http.get<Thing[]>(
          `${this.baseUrl}?userId=${userId}`,
          this.httpOptions
        )
      );
      return things;
    } catch (error) {
      this.handleError('getThingsByUserId', error);
      throw error;
    }
  }

  async updateThing(thingId: string, thing: Thing): Promise<Thing> {
    try {
      const updatedThing = await firstValueFrom(
        this.http.put<Thing>(
          `${this.baseUrl}/${thingId}`,
          thing,
          this.httpOptions
        )
      );
      return updatedThing;
    } catch (error) {
      this.handleError('updateThing', error);
      throw error;
    }
  }

  async deleteThing(thingId: string): Promise<Thing> {
    try {
      const deletedThing = await firstValueFrom(
        this.http.delete<Thing>(`${this.baseUrl}/${thingId}`, this.httpOptions)
      );
      return deletedThing;
    } catch (error) {
      this.handleError('deleteThing', error);
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
