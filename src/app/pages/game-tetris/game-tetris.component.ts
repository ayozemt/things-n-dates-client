import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  Input,
} from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { fromEvent, interval, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-game-tetris',
  templateUrl: './game-tetris.component.html',
  styleUrls: ['./game-tetris.component.scss'],
})
export class GameTetrisComponent implements OnInit, OnDestroy {
  @Input() userName: string | null = null;
  @Input() userId: string | null = null;

  @ViewChild('board', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D;

  boardWidth = 300;
  boardHeight = 600;
  columns = 10;
  rows = 20;
  blockSize = this.boardWidth / this.columns;
  board: number[][] = [];
  score: number = 0;
  currentPiece: any;
  gameLoopSubscription!: Subscription;

  pieces = [
    [1, 1, 1, 1], // I
    [1, 1, 1, 0, 1], // L
    [1, 1, 0, 0, 1, 1], // O
    [1, 1, 0, 0, 0, 1, 1], // Z
    [1, 1, 1, 0, 0, 1], // T
    [1, 0, 0, 0, 1, 1, 1], // J
    [0, 1, 1, 0, 1, 1], // S
  ];

  colors = ['cyan', 'orange', 'yellow', 'red', 'purple', 'blue', 'green'];

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit() {
    this.context = this.canvas.nativeElement.getContext('2d')!;
    this.initBoard();
    this.newPiece();
    this.gameLoopSubscription = interval(1000).subscribe(() => this.gameLoop());
    fromEvent<KeyboardEvent>(document, 'keydown').subscribe((event) =>
      this.handleKey(event)
    );

    this.authService.verifyToken().subscribe((user: any) => {
      this.userName = user.name;
      this.userId = user._id;
    });
  }

  ngOnDestroy() {
    if (this.gameLoopSubscription) {
      this.gameLoopSubscription.unsubscribe();
    }
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
      x: Math.floor(this.columns / 2) - Math.floor(piece.length / 2),
      y: 0,
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
    switch (event.key) {
      case 'ArrowLeft':
        this.movePiece(-1, 0);
        break;
      case 'ArrowRight':
        this.movePiece(1, 0);
        break;
      case 'ArrowDown':
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
        this.rotatePiece();
        break;
    }
    this.drawBoard();
  }

  moveLeft() {
    this.movePiece(-1, 0);
    this.drawBoard();
  }

  moveRight() {
    this.movePiece(1, 0);
    this.drawBoard();
  }

  moveDown() {
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

  rotate() {
    this.rotatePiece();
    this.drawBoard();
  }

  gameLoop() {
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

  gameOver() {
    alert('Game Over');
    this.saveScore();
    this.initBoard();
    this.score = 0;
  }

  saveScore() {
    if (this.userId) {
      const scoreData = {
        userId: this.userId,
        score: this.score,
      };
      this.http.post('/api/tetris/score', scoreData).subscribe((response) => {
        console.log('Score saved', response);
      });
    }
  }
}
