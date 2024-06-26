import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TetrisScoreService } from '../../services/tetris-score.service';
import TetrisScore from '../../interfaces/Tetris-Score';

@Component({
  selector: 'app-tetris-scores',
  templateUrl: './tetris-scores.component.html',
  styleUrls: ['./tetris-scores.component.scss'],
})
export class TetrisScoresComponent implements OnInit {
  userName: string = '';
  topScores: TetrisScore[] = [];
  loading: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<TetrisScoresComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private tetrisScoreService: TetrisScoreService
  ) {
    this.userName = data.userName || '';
  }

  async ngOnInit() {
    try {
      this.loading = true;
      this.topScores = await this.tetrisScoreService.getAllTetrisScores();
    } catch (error) {
      console.error('Error loading high scores:', error);
    } finally {
      this.loading = false;
    }
  }

  onPlay() {
    if (this.userName.trim() !== '' && this.userName.length <= 10) {
      this.dialogRef.close(this.userName);
    }
  }
}
