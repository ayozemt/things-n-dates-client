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

  speed: number = 1000;
  speedUpThreshold: number = 200;
  showMessage: boolean = false;
  messageTimeout: any;

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
  moveLeftInterval!: Subscription;
  moveRightInterval!: Subscription;

  pieces = [
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ], // T
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ], // I
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ], // L
    [
      [1, 1],
      [1, 1],
    ], // O
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ], // Z
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ], // J
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ], // S
  ];

  colors = [
    'mediumpurple',
    'deepskyblue',
    'darkorange',
    'gold',
    'crimson',
    'mediumblue',
    'forestgreen',
  ];

  private tetrisThemeAudio = new Audio('assets/tetris-theme.mp3');
  private clearLineAudio = new Audio('assets/clear-line.mp3');
  private gameOverAudio = new Audio('assets/game-over.mp3');

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
    if (this.moveLeftInterval) {
      this.moveLeftInterval.unsubscribe();
    }
    if (this.moveRightInterval) {
      this.moveRightInterval.unsubscribe();
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
    this.tetrisThemeAudio.play();
    this.newPiece();
    this.setGameLoop();
  }

  setGameLoop() {
    if (this.gameLoopSubscription) {
      this.gameLoopSubscription.unsubscribe();
    }
    this.gameLoopSubscription = interval(this.speed).subscribe(() =>
      this.gameLoop()
    );
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

  clearCanvas() {
    this.context.clearRect(0, 0, this.boardWidth, this.boardHeight);
  }

  drawBoard() {
    this.clearCanvas();
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
    if (this.currentPiece) {
      this.drawPiece(this.currentPiece);
    }
    if (this.showMessage) {
      this.drawFasterMessage();
    }
  }

  drawFasterMessage() {
    this.context.fillStyle = 'white';
    this.context.font = '30px Arial';
    this.context.textAlign = 'center';
    this.context.fillText('Fasteя!', this.boardWidth / 2, this.boardHeight / 2);
  }

  drawPiece(piece: any) {
    this.context.fillStyle = piece.color;
    this.context.strokeStyle = 'pink';
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col]) {
          const x = piece.x + col;
          const y = piece.y + row;
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
    const { shape } = this.currentPiece;
    const newShape = shape[0].map((_: number, i: number) =>
      shape.map((row: number[]) => row[i]).reverse()
    );

    const oldShape = this.currentPiece.shape;
    this.currentPiece.shape = newShape;
    if (this.collides()) {
      this.currentPiece.x -= 1;
      if (this.collides()) {
        this.currentPiece.x += 2;
        if (this.collides()) {
          this.currentPiece.x -= 1;
          this.currentPiece.shape = oldShape;
        }
      }
    } else {
      while (this.currentPiece.x + newShape[0].length > this.columns) {
        this.currentPiece.x--;
      }
      while (this.currentPiece.x < 0) {
        this.currentPiece.x++;
      }
    }
    this.drawBoard();
  }

  collides() {
    const { shape, x, y } = this.currentPiece;
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          if (
            newX < 0 || // fuera del borde izquierdo
            newX >= this.columns || // fuera del borde derecho
            newY >= this.rows || // fuera del fondo
            (newY >= 0 && this.board[newY][newX] !== 0) // colisión con otra pieza
          ) {
            return true;
          }
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

  startMovingLeft() {
    if (this.isPaused) return;
    if (this.moveLeftInterval) {
      this.moveLeftInterval.unsubscribe();
    }
    this.moveLeftInterval = interval(100).subscribe(() => {
      this.movePiece(-1, 0);
      this.drawBoard();
    });
  }

  stopMovingLeft() {
    if (this.moveLeftInterval) {
      this.moveLeftInterval.unsubscribe();
    }
  }

  moveRight() {
    if (this.isPaused) return;
    this.movePiece(1, 0);
    this.drawBoard();
  }

  startMovingRight() {
    if (this.isPaused) return;
    if (this.moveRightInterval) {
      this.moveRightInterval.unsubscribe();
    }
    this.moveRightInterval = interval(100).subscribe(() => {
      this.movePiece(1, 0);
      this.drawBoard();
    });
  }

  stopMovingRight() {
    if (this.moveRightInterval) {
      this.moveRightInterval.unsubscribe();
    }
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

    if (this.score >= this.speedUpThreshold) {
      this.speedUp();
      this.speedUpThreshold += 200; // Actualizar el umbral para el próximo incremento
    }

    this.drawBoard();
  }

  speedUp() {
    this.speed = Math.max(100, this.speed - 100); // Reducir el intervalo, mínimo 100 ms
    this.setGameLoop();
    this.showMessage = true;

    clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => {
      this.showMessage = false;
      this.drawBoard();
    }, 2000);
  }

  placePiece() {
    const { shape, x, y } = this.currentPiece;
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          if (newY >= 0) {
            this.board[newY][newX] =
              this.colors.indexOf(this.currentPiece.color) + 1;
          }
        }
      }
    }
  }

  clearLines() {
    let linesCleared = 0;
    this.board = this.board.filter((row) => {
      if (row.every((cell) => cell !== 0)) {
        linesCleared++;
        this.clearLineAudio.play();
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
    this.fillBoardAnimation();
    this.tetrisThemeAudio.pause();
    this.tetrisThemeAudio.currentTime = 0;
    this.gameOverAudio.play();
    if (this.gameLoopSubscription) {
      this.gameLoopSubscription.unsubscribe();
    }
    if (this.moveDownInterval) {
      this.moveDownInterval.unsubscribe();
    }
    await this.saveScore();
    this.currentPiece = null;
    await this.sleep(4000);
    this.openStartModal();
    this.clearCanvas();
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

  async fillBoardAnimation() {
    for (let row = this.rows; row >= 0; row--) {
      this.board[row] = Array(this.columns).fill(1);
      this.drawBoard();
      await this.sleep(50); // tiempo en pintar cada línea
    }
    this.showGameOverMessage();
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  showGameOverMessage() {
    this.context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.context.fillRect(0, 0, this.boardWidth, this.boardHeight);
    this.context.fillStyle = 'white';
    this.context.font = '30px Arial';
    this.context.textAlign = 'center';
    this.context.fillText(
      'GAME OVER',
      this.boardWidth / 2,
      this.boardHeight / 2
    );
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.drawPausedMessage();
      this.tetrisThemeAudio.pause();
    } else {
      this.drawBoard();
      this.tetrisThemeAudio.play();
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
