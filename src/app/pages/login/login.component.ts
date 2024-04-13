import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private userService: UserService, private router: Router) {}

  async onSubmit() {
    try {
      const user = await this.userService.login({
        email: this.email,
        password: this.password,
      });
      // Login successful, navigate to home page or wherever needed
      this.router.navigate(['/list']);
    } catch (error) {
      // Handle login error, show error message to user
      console.error('Login error:', error);
    }
  }
}
