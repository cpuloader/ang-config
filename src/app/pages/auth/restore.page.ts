import { Inject, Component, OnInit, OnDestroy, ViewChild, PLATFORM_ID } from "@angular/core";
import { Router }   from '@angular/router';
import { NgForm } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash-es';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'restore-page',
  templateUrl: './restore.page.html',
  styleUrls: ['./auth-pages.scss']
})
export class PasswordRestorePage implements OnInit, OnDestroy {
  error: any;
  model: any = {
    email: ''
  };
  isSending: boolean = false;

  private _restoreSub: Subscription;

  @ViewChild('restoreForm')restoreForm: NgForm;

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
      this.restoreForm.form.controls[field].setErrors(err);
    });
    //this.restoreForm.form.controls.email.markAsTouched(); // because we didn't touch it on init
  }

  getErrorMessage(): string {
    if (this.restoreForm.form.controls.email.hasError('not_found')) {
      return 'Email not found';
    } else if (this.restoreForm.form.controls.email.hasError('invalid')) {
      return 'Invalid email';
    } else if (this.restoreForm.form.controls.email.hasError('required')) {
      return 'You must enter a value';
    }
    return null;
  }

  send() {
    this.error = null;
    if (this.isSending) return;
    this.isSending = true;

    if (this._restoreSub) this._restoreSub.unsubscribe();

    this._restoreSub = this.authService.restorePassword(this.model.email)
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
    this.model.email = this.authService.isAuthorized() ? this.authService.getMe()?.email : '';
  }

  ngOnDestroy(): void {
    if (this._restoreSub) this._restoreSub.unsubscribe();
  }
}
