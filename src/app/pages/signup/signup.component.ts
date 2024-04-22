import { Component } from '@angular/core';
import User from '../../interfaces/User';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, Validators } from '@angular/forms';
import { passwordValidator } from '../../auth/password.validator';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  user: User = { _id: '', email: '', password: '', name: '' };

  constructor(
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  passwordFormControl = new FormControl('', [
    Validators.required,
    passwordValidator(),
  ]);

  nameFormControl = new FormControl('', [Validators.required]);

  async onSubmit(): Promise<void> {
    if (
      this.emailFormControl.valid &&
      this.passwordFormControl.valid &&
      this.nameFormControl.valid
    ) {
      try {
        const signedUpUser = await this.userService.signup({
          email: this.emailFormControl.value || '',
          password: this.passwordFormControl.value || '',
          name: this.nameFormControl.value || '',
          _id: '',
        });
        console.log('User signed up successfully:', signedUpUser);
        this.router.navigate(['/login']);
      } catch (error: any) {
        console.error('Error signing up:', error);
        let errorMessage = 'An error occurred while signing up';
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
