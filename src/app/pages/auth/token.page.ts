import { Inject, Component, OnInit, OnDestroy, ViewChild, PLATFORM_ID } from "@angular/core";
import { Router, ActivatedRoute }   from '@angular/router';
import { NgForm } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash-es';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'token-page',
  templateUrl: './token.page.html',
  styleUrls: ['./auth-pages.scss']
})
export class TokenPage implements OnInit, OnDestroy {
  error: any;
  model: any = {
    token: ''
  };
  isSending: boolean = false;

  private _tokenSub: Subscription;

  @ViewChild('tokenForm')tokenForm: NgForm;

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
      this.tokenForm.form.controls[field].setErrors(err);
    });
    this.tokenForm.form.controls.confirmation_token.markAsTouched(); // because we didn't touch it on init
  }

  getErrorMessage(): string {
    if (this.tokenForm.form.controls.confirmation_token.hasError('already_confirmed')) {
      return 'This token is already confirmed';
    } else if (this.tokenForm.form.controls.confirmation_token.hasError('invalid')) {
      return 'This token is invalid';
    } else if (this.tokenForm.form.controls.confirmation_token.hasError('required')) {
      return 'You must enter a value';
    }
    return null;
  }

  send() {
    this.error = null;
    if (this.isSending) return;
    this.isSending = true;

    if (this._tokenSub) this._tokenSub.unsubscribe();

    this._tokenSub = this.authService.sendToken(this.model.token)
      .subscribe(
          response => {
            this.isSending = false;
            // Go to settings because user will be updated there (or logouted by interceptor)
            this.router.navigate(['/settings']);
          },
          err => {
            this.isSending = false;
            this._handleErrors(err.error);
          }
      );
  }

  ngOnInit(): void {
    this.model.token = this.route.snapshot.paramMap.get('token');
    if (this.model.token) {
      this.send();
    }
  }

  ngOnDestroy(): void {
    if (this._tokenSub) this._tokenSub.unsubscribe();
  }
}
