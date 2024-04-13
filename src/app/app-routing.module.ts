import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { AnonGuard } from './auth/anon.guard';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ThingListComponent } from './pages/thing-list/thing-list.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [AnonGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [AnonGuard] },
  { path: 'list', component: ThingListComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
