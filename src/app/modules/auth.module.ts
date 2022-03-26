import { NgModule }      from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule }   from '../shared/shared.module';
import { LoginPage } from '../pages/auth/login.page';
import { SignupPage } from '../pages/auth/signup.page';
import { CompletePage } from '../pages/auth/complete.page';
import { TokenPage } from '../pages/auth/token.page';
import { PasswordRestorePage } from '../pages/auth/restore.page';
import { PasswordResetPage } from '../pages/auth/reset.page';

const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'signup', component: SignupPage },
  { path: 'complete', component: CompletePage },
  { path: 'confirm/:token', component: TokenPage },
  { path: 'password/restore', component: PasswordRestorePage },
  { path: 'password/reset/:token', component: PasswordResetPage }
];

@NgModule({
  declarations: [
    LoginPage,
    SignupPage,
    CompletePage,
    TokenPage,
    PasswordRestorePage,
    PasswordResetPage
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  exports: []
})
export class AuthModule {}
