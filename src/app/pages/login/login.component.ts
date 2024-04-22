import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  passwordFormControl = new FormControl('', [Validators.required]);

  async onSubmit() {
    if (this.emailFormControl.valid && this.passwordFormControl.valid) {
      try {
        const user = await this.userService.login({
          email: this.emailFormControl.value || '',
          password: this.passwordFormControl.value || '',
        });
        this.router.navigate(['/list']);
      } catch (error: any) {
        console.error('Login error:', error);
        let errorMessage = 'An error occurred';
        if (error.status === 401 || error.status === 404) {
          errorMessage = 'Wrong username or password';
        }
        if (error.status === 400) {
          errorMessage = 'Provide Email and Password';
        }
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      }
    } else {
      this.snackBar.open('Please fill in all fields correctly', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }
}
