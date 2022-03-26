import { Inject, Component, OnInit, OnDestroy, ViewChild, PLATFORM_ID } from "@angular/core";
import { Router, ActivatedRoute }   from '@angular/router';
import { NgForm } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash-es';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'reset-page',
  templateUrl: './reset.page.html',
  styleUrls: ['./auth-pages.scss']
})
export class PasswordResetPage implements OnInit, OnDestroy {
  error: any;
  model: any = {
    password: '',

  };
  token: string = '';

  isSending: boolean = false;

  private _passwordSub: Subscription;

  @ViewChild('passwordForm')passwordForm: NgForm;

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
              private router: Router,
              private route: ActivatedRoute,
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
      this.passwordForm.form.controls.password.setErrors(err);
    });
  }

  getErrorMessage(): string {
    if (this.passwordForm.form.controls.password.hasError('minLength')) {
      return 'This password is too short';
    } else if (this.passwordForm.form.controls.password.hasError('invalid')) {
      return 'Token or password is invalid';
    } else if (this.passwordForm.form.controls.password.hasError('required')) {
      return 'You must enter a value';
    }
    return null;
  }

  send() {
    this.error = null;
    if (this.isSending || !this.token) return;
    this.isSending = true;

    if (this._passwordSub) this._passwordSub.unsubscribe();

    this._passwordSub = this.authService.resetPassword(this.model.password, this.token)
      .subscribe(
          response => {
            this.isSending = false;
            // TODO: show notification here
            // ....
            this.router.navigate(['/auth/login']);
          },
          err => {
            this.isSending = false;
            this._handleErrors(err.error);
          }
      );
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
  }

  ngOnDestroy(): void {
    if (this._passwordSub) this._passwordSub.unsubscribe();
  }
}
