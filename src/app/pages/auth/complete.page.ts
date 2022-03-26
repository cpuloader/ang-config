import { Inject, Component, OnInit, OnDestroy, ViewChild, PLATFORM_ID } from "@angular/core";
import { Router }   from '@angular/router';
import { NgForm } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash-es';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../../objects/objects';

@Component({
  selector: 'complete-page',
  templateUrl: './complete.page.html',
  styleUrls: ['./auth-pages.scss']
})
export class CompletePage implements OnInit, OnDestroy {
  error: any;
  user: User = <User>{
    id: -1,
    email: '',
    password: ''
  };
  isSending: boolean = false;

  private _completeSub: Subscription;

  @ViewChild('completeForm')completeForm: NgForm;

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
      this.completeForm.form.controls[field].setErrors(err);
    });
  }

  getErrorMessage(fieldName): string {
    if (this.completeForm.form.controls[fieldName].hasError('already_in_use')) {
      return 'This ' + fieldName + ' is already in use';
    } else if (this.completeForm.form.controls[fieldName].hasError('invalid')) {
      return 'This ' + fieldName + ' is invalid';
    } else if (this.completeForm.form.controls[fieldName].hasError('required')) {
      return 'You must enter a value';
    }
    return null;
  }

  send() {
    this.error = null;
    if (this.isSending) return;
    this.isSending = true;

    if (this._completeSub) this._completeSub.unsubscribe();

    this._completeSub = this.authService.complete(this.user.email, this.user.password)
      .subscribe(
          response => {
            this.isSending = false;
            this.router.navigate(['/settings']);
          },
          err => {
            this.isSending = false;
            this._handleErrors(err.error);
          }
      );
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.authService.isAuthorized()) {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    if (this._completeSub) this._completeSub.unsubscribe();
  }
}
