import { Component } from '@angular/core';
import User from '../../interfaces/User';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  user: User = { email: '', password: '', name: '' };

  constructor(private userService: UserService) {}

  async onSubmit(): Promise<void> {
    const { email, password, name } = this.user;
    try {
      const signedUpUser = await this.userService.signup({
        email,
        password,
        name,
      });
      console.log('User signed up successfully:', signedUpUser);
    } catch (error) {
      console.error('Error signing up:', error);
    }
  }
}
