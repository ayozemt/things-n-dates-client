import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, Validators } from '@angular/forms';
import { passwordValidator } from '../../auth/password.validator';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  passwordFormControl = new FormControl('', [
    Validators.required,
    passwordValidator(),
  ]);
  token: string = '';

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.token = params['token'];
    });
  }

  async onSubmit(): Promise<void> {
    if (this.passwordFormControl.valid) {
      try {
        const newPassword = this.passwordFormControl.value || '';
        await this.userService.resetPassword(this.token, newPassword);
        this.snackBar.open('Password succesfully changed', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.router.navigate(['/login']);
      } catch (error: any) {
        console.log('Error changing password:', error);
        this.snackBar.open(
          error.error.message || 'Error changing password.',
          'Close',
          {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          }
        );
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
