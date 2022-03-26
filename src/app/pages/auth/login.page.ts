import { Inject, Component, OnInit, OnDestroy, ViewChild, PLATFORM_ID } from "@angular/core";
import { Router }   from '@angular/router';
import { NgForm } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import * as _ from 'lodash-es';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../../objects/objects';

@Component({
  selector: 'login-page',
  templateUrl: './login.page.html',
  styleUrls: ['./auth-pages.scss']
})
export class LoginPage implements OnInit, OnDestroy {
  error: any;
  user: User = <User>{
    id: -1,
    email: '',
    password: ''
  };
  remember_me: boolean = true;
  isSending: boolean = false;

  private _loginSub: Subscription;

  @ViewChild('loginForm')loginForm: NgForm;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              private router: Router,
              private authService: AuthService,
              private cookieService: CookieService,
              public translate: TranslateService) {
  }

  // errors
  private _handleErrors(e: any) {
    if (!e.errors) {
      this.error = e.error;
      return;
    }
    // custom validation errors
    _.each(e.errors, (errs, field) => {
      // take last error from array
      const errName = errs[errs.length-1];
      let err = {}; err[errName] = true;
      this.loginForm.form.controls[field].setErrors(err);
    });
  }

  getErrorMessage(fieldName): string {
    if (this.loginForm.form.controls[fieldName].hasError('already_in_use')) {
      return 'This ' + fieldName + ' is already in use';
    } else if (this.loginForm.form.controls[fieldName].hasError('invalid')) {
      return 'This ' + fieldName + ' is invalid';
    } else if (this.loginForm.form.controls[fieldName].hasError('required')) {
      return 'You must enter a value';
    }
    return null;
  }

  login() {
    this.error = null;
    if (this.isSending) return;
    this.isSending = true;

    if (this._loginSub) this._loginSub.unsubscribe();

    this._loginSub = this.authService.login(this.user.email, this.user.password, this.remember_me)
      .subscribe(
          response => {
            this.isSending = false;
            this.router.navigate(['/']);
          },
          err => {
            this.isSending = false;
            this._handleErrors(err.error);
          }
      );
  }

  onCheck(event: any) {
    if (event.checked) {
      let expireDate = new Date();
      expireDate.setFullYear(expireDate.getFullYear() + 1);
      this.cookieService.set('remember_me', 'true', { expires: expireDate, path: '/', sameSite: 'Lax' });
    } else {
      this.cookieService.delete('remember_me', '/');
    }
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.authService.isAuthorized()) {
      this.router.navigate(['/']);
    }

    this.remember_me = !!this.cookieService.get('remember_me');
  }

  ngOnDestroy(): void {
    if (this._loginSub) this._loginSub.unsubscribe();
  }
}
