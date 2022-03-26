import { Component, OnInit, OnDestroy, Input, Output } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators  } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash-es';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../../objects/objects';

@Component({
    selector: 'settings-confirm-dialog',
    templateUrl: './settings-confirm-dialog.component.html',
    styleUrls: ['./settings-confirm-dialog.component.scss']
})
export class SettingsConfirmDialogComponent implements OnInit, OnDestroy {
  user: User;
  emailChanged: boolean;
  passwordChanged: boolean;
  isSending: boolean;
  passwordControl: FormControl;
  newEmail: string;

  private _errType: string;

  constructor(public translate: TranslateService,
              private fb: FormBuilder,
              private mdDialogRef: MatDialogRef<SettingsConfirmDialogComponent>,
              private authService: AuthService) {
    mdDialogRef.disableClose = true; // do not close by click outside
  }

  // errors
  handleErrors(errors: any) {
    let errs: string;
    if (errors['email']) { // show email errors first
      errs = errors['email'];
      this._errType = 'email';
    } else { // password errors
      errs = errors['current_password'];
      this._errType = 'current_password';
    }
    if (!errs) return;
    // take last error from array
    const errName = errs[errs.length-1];
    let err = {}; err[errName] = true;
    this.passwordControl.setErrors(err);
  }

  getErrorMessage(): string {
    if (this.passwordControl.hasError('already_in_use')) {
      return (this._errType === 'email') ? 'This email is already in use' : 'This password is already in use';
    } else if (this.passwordControl.hasError('invalid')) {
      return (this._errType === 'email') ? 'This email is invalid' : 'This password is invalid';
    } else if (this.passwordControl.hasError('minLength')) {
      return 'Password is too short!';
    } else if (this.passwordControl.hasError('required')) {
      return 'You must enter a password';
    } else if (this.passwordControl.hasError('other_error')) {
      return 'Error!';
    }
    return null;
  }

  // buttons
  cancel() {
    setTimeout(() => this.mdDialogRef.close(false), 50);
  }

  submit() {
    console.log('control', this.passwordControl);
    if (!this.passwordControl.valid) return;

    if (this.isSending) return;
    this.isSending = true;

    if (this.passwordChanged) {
      this.user.current_password = this.passwordControl.value;
    }

    this.authService.updateMe(this.user).pipe(first()).subscribe(
      res => {
        this.isSending = false;
        setTimeout(() => this.mdDialogRef.close(true), 50);
      },
      err => {
        this.isSending = false;
        try {
          let er = err.error.errors;
          this.handleErrors(er);
        } catch(e) {
          let err = {}; err['other_error'] = true;
          this.passwordControl.setErrors(err);
          console.log('Error!');
        }
      });
  }

  ngOnInit() {
    //this.user.email = '1@st.com'; // TEST!
    this.newEmail = this.user.email;
    this.passwordControl = new FormControl('', [Validators.required, Validators.minLength(5)]);
  }

  ngOnDestroy() {

  }
}
