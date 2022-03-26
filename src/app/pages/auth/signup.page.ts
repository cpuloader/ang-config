import { Component, OnInit, OnDestroy, ViewChild, Inject, PLATFORM_ID } from "@angular/core";
import { Router }   from '@angular/router';
import { NgForm } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash-es';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../../objects/objects';


@Component({
  selector: 'signup-page',
  templateUrl: './signup.page.html',
  styleUrls: ['./auth-pages.scss']
})
export class SignupPage implements OnInit, OnDestroy {
  error: any;
  user: User = <User>{
    id: -1,
    email: '',
    password: ''
  };
  confirm_password: string;
  lang: string = 'en';
  isSending: boolean = false;

  private _signupSub: Subscription;

  @ViewChild('signupForm')signupForm: NgForm;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              private router: Router,
              private authService: AuthService,
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
      this.signupForm.form.controls[field].setErrors(err);
    });
  }

  getErrorMessage(fieldName): string {
    if (this.signupForm.form.controls[fieldName].hasError('already_in_use')) {
      return 'This ' + fieldName + ' is already in use';
    } else if (this.signupForm.form.controls[fieldName].hasError('invalid')) {
      return 'This ' + fieldName + ' is invalid';
    } else if (this.signupForm.form.controls[fieldName].hasError('required')) {
      return 'You must enter a value';
    }
    return null;
  }

  signup() {
    this.error = null;
    if (this.isSending) return;
    this.isSending = true;

    if (this._signupSub) this._signupSub.unsubscribe();

    this._signupSub = this.authService.signup(this.user.email, this.user.password, this.lang)
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

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId) || this.authService.isAuthorized()) {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    if (this._signupSub) this._signupSub.unsubscribe();
  }
}
