import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { fromEvent, interval, Subscription } from 'rxjs';
import { TetrisScoreService } from '../../services/tetris-score.service';
import TetrisScore from '../../interfaces/Tetris-Score';
import { TetrisScoresComponent } from '../../components/tetris-scores/tetris-scores.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-game-tetris',
  templateUrl: './game-tetris.component.html',
  styleUrls: ['./game-tetris.component.scss'],
})
export class GameTetrisComponent implements OnInit, OnDestroy {
  userName: string = '';
  isGameOver: boolean = false;
  isModalOpen: boolean = false;
  isPaused: boolean = false;

  @ViewChild('board', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D;

  boardWidth = 300;
  boardHeight = 540;
  columns = 10;
  rows = 18;
  blockSize = this.boardWidth / this.columns;
  board: number[][] = [];
  score: number = 0;
  highScore: number = 0;
  currentPiece: any;
  gameLoopSubscription!: Subscription;
  moveDownInterval!: Subscription;

  pieces = [
    [1, 1, 1, 1], // I
    [1, 1, 1, 0, 1], // L
    [0, 1, 1, 0, 0, 1, 1], // O
    [1, 1, 0, 0, 0, 1, 1], // Z
    [1, 1, 1, 0, 0, 1], // T
    [1, 0, 0, 0, 1, 1, 1], // J
    [0, 1, 1, 0, 1, 1], // S
  ];

  colors = ['cyan', 'orange', 'yellow', 'red', 'purple', 'blue', 'green'];

  constructor(
    private tetrisScoreService: TetrisScoreService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.context = this.canvas.nativeElement.getContext('2d')!;
    this.initBoard();
    this.openStartModal();
    fromEvent<KeyboardEvent>(document, 'keydown').subscribe((event) =>
      this.handleKey(event)
    );
    fromEvent<TouchEvent>(this.canvas.nativeElement, 'touchstart').subscribe(
      () => this.togglePause()
    );
  }

  ngOnDestroy() {
    if (this.gameLoopSubscription) {
      this.gameLoopSubscription.unsubscribe();
    }
    if (this.moveDownInterval) {
      this.moveDownInterval.unsubscribe();
    }
  }

  async openStartModal() {
    this.isModalOpen = true;
    const dialogRef = this.dialog.open(TetrisScoresComponent, {
      width: '400px',
      data: { userName: this.userName },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        this.userName = result;
        this.updateTitle();
        await this.loadHighScore();
        this.isGameOver = false;
        this.resetGame();
      }
      this.isModalOpen = false;
    });
  }

  resetGame() {
    this.score = 0;
    this.initBoard();
    if (this.isGameOver) {
      return;
    }
    this.startGame();
  }

  updateTitle() {
    document.title = `Welcome to Tetris, ${this.userName}!!`;
  }

  async loadHighScore() {
    const scores = await this.tetrisScoreService.getAllTetrisScores();
    this.highScore = scores.length > 0 ? scores[0].score : 0;
  }

  startGame() {
    this.newPiece();
    if (this.gameLoopSubscription) {
      this.gameLoopSubscription.unsubscribe();
    }
    this.gameLoopSubscription = interval(1000).subscribe(() => this.gameLoop());
  }

  initBoard() {
    this.board = Array.from({ length: this.rows }, () =>
      Array(this.columns).fill(0)
    );
  }

  newPiece() {
    const id = Math.floor(Math.random() * this.pieces.length);
    const piece = this.pieces[id];
    this.currentPiece = {
      x: 3,
      y: -1,
      shape: piece,
      color: this.colors[id],
    };
  }

  drawBoard() {
    this.context.clearRect(0, 0, this.boardWidth, this.boardHeight);
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        if (this.board[y][x] !== 0) {
          this.context.fillStyle = this.colors[this.board[y][x] - 1];
          this.context.fillRect(
            x * this.blockSize,
            y * this.blockSize,
            this.blockSize,
            this.blockSize
          );
          this.context.strokeRect(
            x * this.blockSize,
            y * this.blockSize,
            this.blockSize,
            this.blockSize
          );
        }
      }
    }
    this.drawPiece(this.currentPiece);
  }

  drawPiece(piece: any) {
    this.context.fillStyle = piece.color;
    this.context.strokeStyle = 'pink';
    for (let i = 0; i < piece.shape.length; i++) {
      if (piece.shape[i]) {
        const x = piece.x + (i % 4);
        const y = piece.y + Math.floor(i / 4);
        this.context.fillRect(
          x * this.blockSize,
          y * this.blockSize,
          this.blockSize,
          this.blockSize
        );
        this.context.strokeRect(
          x * this.blockSize,
          y * this.blockSize,
          this.blockSize,
          this.blockSize
        );
      }
    }
  }

  movePiece(dx: number, dy: number) {
    this.currentPiece.x += dx;
    this.currentPiece.y += dy;
    if (this.collides()) {
      this.currentPiece.x -= dx;
      this.currentPiece.y -= dy;
      return false;
    }
    return true;
  }

  rotatePiece() {
    const shape = this.currentPiece.shape;
    const newShape = [];
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        newShape[x * 4 + y] = shape[(3 - y) * 4 + x];
      }
    }
    const oldShape = this.currentPiece.shape;
    this.currentPiece.shape = newShape;
    if (this.collides()) {
      this.currentPiece.shape = oldShape;
    }
  }

  collides() {
    const { shape, x, y } = this.currentPiece;
    for (let i = 0; i < shape.length; i++) {
      if (shape[i]) {
        const newX = x + (i % 4);
        const newY = y + Math.floor(i / 4);
        if (
          newX < 0 ||
          newX >= this.columns ||
          newY >= this.rows ||
          (newY >= 0 && this.board[newY][newX])
        ) {
          return true;
        }
      }
    }
    return false;
  }

  handleKey(event: KeyboardEvent) {
    if (event.key === 'p' || event.key === 'P') {
      this.togglePause();
    }
    if (this.isPaused) {
      return;
    }
    switch (event.key) {
      case 'ArrowLeft':
        this.movePiece(-1, 0);
        break;
      case 'ArrowRight':
        this.movePiece(1, 0);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!this.movePiece(0, 1)) {
          this.placePiece();
          this.clearLines();
          this.newPiece();
          if (this.collides()) {
            this.gameOver();
          }
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.rotatePiece();
        break;
    }
    this.drawBoard();
  }

  moveLeft() {
    if (this.isPaused) return;
    this.movePiece(-1, 0);
    this.drawBoard();
  }

  moveRight() {
    if (this.isPaused) return;
    this.movePiece(1, 0);
    this.drawBoard();
  }

  moveDown() {
    if (this.isPaused) return;
    if (!this.movePiece(0, 1)) {
      this.placePiece();
      this.clearLines();
      this.newPiece();
      if (this.collides()) {
        this.gameOver();
      }
    }
    this.drawBoard();
  }

  startMovingDown() {
    if (this.isPaused) return;
    if (this.moveDownInterval) {
      this.moveDownInterval.unsubscribe();
    }
    this.moveDownInterval = interval(100).subscribe(() => {
      if (!this.movePiece(0, 1)) {
        this.placePiece();
        this.clearLines();
        this.newPiece();
        if (this.collides()) {
          this.gameOver();
        }
        this.stopMovingDown();
      }
      this.drawBoard();
    });
  }

  stopMovingDown() {
    if (this.moveDownInterval) {
      this.moveDownInterval.unsubscribe();
    }
  }

  rotate() {
    if (this.isPaused) return;
    this.rotatePiece();
    this.drawBoard();
  }

  gameLoop() {
    if (this.isPaused || this.isGameOver) return;
    if (!this.movePiece(0, 1)) {
      this.placePiece();
      this.clearLines();
      this.newPiece();
      if (this.collides()) {
        this.gameOver();
      }
    }
    this.drawBoard();
  }

  placePiece() {
    const { shape, x, y } = this.currentPiece;
    for (let i = 0; i < shape.length; i++) {
      if (shape[i]) {
        const newX = x + (i % 4);
        const newY = y + Math.floor(i / 4);
        if (newY >= 0) {
          this.board[newY][newX] =
            this.colors.indexOf(this.currentPiece.color) + 1;
        }
      }
    }
  }

  clearLines() {
    let linesCleared = 0;
    this.board = this.board.filter((row) => {
      if (row.every((cell) => cell !== 0)) {
        linesCleared++;
        return false;
      }
      return true;
    });
    while (this.board.length < this.rows) {
      this.board.unshift(Array(this.columns).fill(0));
    }
    this.score += linesCleared * 10;
  }

  async gameOver() {
    if (this.isGameOver || this.isModalOpen) {
      return;
    }
    this.isGameOver = true;
    if (this.gameLoopSubscription) {
      this.gameLoopSubscription.unsubscribe();
    }
    if (this.moveDownInterval) {
      this.moveDownInterval.unsubscribe();
    }
    await this.saveScore();
    this.openStartModal();
  }

  async saveScore() {
    if (this.userName) {
      const newScore: TetrisScore = {
        _id: '',
        userName: this.userName,
        score: this.score,
        date: new Date(),
      };
      await this.tetrisScoreService.createTetrisScore(newScore);
      this.snackBar.open('Score saved!', 'Close', { duration: 3000 });
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.drawPausedMessage();
    } else {
      this.drawBoard();
    }
  }

  drawPausedMessage() {
    const lines = ['Game paused.', 'Touch here or press P', 'to resume'];
    const lineHeight = 25;

    this.context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.context.fillRect(0, 0, this.boardWidth, this.boardHeight);
    this.context.fillStyle = 'white';
    this.context.font = '20px Arial';
    this.context.textAlign = 'center';
    lines.forEach((line, index) => {
      this.context.fillText(
        line,
        this.boardWidth / 2,
        this.boardHeight / 2 + index * lineHeight
      );
    });
  }
}
