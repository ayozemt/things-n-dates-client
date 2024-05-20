import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, firstValueFrom } from 'rxjs';
import TetrisScore from '../interfaces/Tetris-Score';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class TetrisScoreService {
  private baseUrl = environment.apiUrl + '/tetrisScore';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {}

  async createTetrisScore(tetrisScore: TetrisScore): Promise<TetrisScore> {
    try {
      const createdTetrisScore = await firstValueFrom(
        this.http.post<TetrisScore>(
          `${this.baseUrl}`,
          tetrisScore,
          this.httpOptions
        )
      );
      return createdTetrisScore;
    } catch (error) {
      throw error;
    }
  }

  async getAllTetrisScores(): Promise<TetrisScore[]> {
    try {
      const tetrisScores = await firstValueFrom(
        this.http.get<TetrisScore[]>(`${this.baseUrl}/list`, this.httpOptions)
      );
      return tetrisScores;
    } catch (error) {
      throw error;
    }
  }

  async getTetrisScoreById(tetrisScoreId: string): Promise<TetrisScore> {
    try {
      const tetrisScore = await firstValueFrom(
        this.http.get<TetrisScore>(
          `${this.baseUrl}/${tetrisScoreId}`,
          this.httpOptions
        )
      );
      return tetrisScore;
    } catch (error) {
      throw error;
    }
  }

  async deleteTetrisScore(tetrisScoreId: string): Promise<TetrisScore> {
    try {
      const deletedTetrisScore = await firstValueFrom(
        this.http.delete<TetrisScore>(
          `${this.baseUrl}/${tetrisScoreId}`,
          this.httpOptions
        )
      );
      return deletedTetrisScore;
    } catch (error) {
      throw error;
    }
  }
}
