import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef } from "@angular/core";
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators  } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipList, MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash-es';

import { WindowRef } from '../core/services/window.service';
import { AuthService } from '../core/services/auth.service';
import { CountryService } from '../core/services/country.service';
import { User, Country, City, Avatar } from '../objects/objects';
import { tagList } from '../lists/lists';
import { removeFirst } from '../utils/utils';
import { SettingsConfirmDialogComponent } from '../components/settings/settings-confirm-dialog.component';


@Component({
  selector: 'settings-page',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage implements OnInit, OnDestroy {
  form: FormGroup;
  isReady: boolean;
  private _me: User = this.authService.getMe();
  user: User;
  //flags
  success: boolean = false;
  isSending: boolean = false; // blocking avatar upload

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly tags: string[] = tagList;
  countries: Country[] = [];
  cities: City[] = [];
  currentCountry: Country;
  dialog: MatDialogRef<any>;

  private _formSub: Subscription;
  private _aliasesSub: Subscription;
  private _genresSub: Subscription;
  private _linksSub: Subscription;

  @ViewChild('aliasesList') aliasesList: MatChipList;
  @ViewChild('genresList') genresList: MatChipList;
  @ViewChild('linksList') linksList: MatChipList;

  constructor(private router: Router,
              private windowRef: WindowRef,
              private fb: FormBuilder,
              private vcr: ViewContainerRef,
              private mdDialog: MatDialog,
              private authService: AuthService,
              private countryService: CountryService,
              public translate: TranslateService) {
  }

  onAvatarChange(ava: Avatar) {
    this.user.avatar = ava;
    this._saveBackup();
  }

  get aliasesControls(): FormArray {
    return this.form.controls.aliases as FormArray;
  }

  get genresControls(): FormControl {
    return this.form.controls.genres as FormControl;
  }

  get countryControls(): FormControl {
    return this.form.controls.country as FormControl;
  }

  get cityControls(): FormControl {
    return this.form.controls.city as FormControl;
  }

  get linksControls(): FormArray {
    return this.form.controls.links as FormArray;
  }

  addChip(event: MatChipInputEvent, name: string): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      switch(name) {
        case 'alias': this.aliasesControls.push(this.fb.control(value.trim()));
        break;
        case 'link': {
          // test, find and remove "http(s)://"
          if (/^((http|https):\/\/)?[\w-]+(\.[\w-]+)+/.test(value)) {
            const result = value.match(new RegExp(/(\b(http|https)\b:\/\/)([^\s]*)/));
            if (result && result.length === 4) {
              this.linksControls.push(this.fb.control(result[3]));
            } else {
              this.linksControls.push(this.fb.control(value.trim()));
            }
          } else return;
        }
        break;
      }
    }

    if (input) {
      input.value = '';
    }
  }

  removeChip(alias: string, name: string): void {
    let control: FormControl | FormArray;

    switch(name) {
      case 'alias': control = this.aliasesControls;
      break;
      case 'link': control = this.linksControls;
      break;
      default: return;
    }

    const index = control.value.indexOf(alias);

    if (index >= 0) {
      control.removeAt(index);
    }
  }

  removeGenre(genre: string) {
    const tlist = this.genresControls.value as string[];
    removeFirst(tlist, genre);
    this.genresControls.markAsTouched(); // to trigger mat-error
    this.genresControls.setValue(tlist.slice()); // to trigger change detection
  }

  countryChanged(country: any) {
    this.currentCountry = country;
    if (!country) return;
    this.cities = [];
    this.getCities();
  }

  djStatusChanged(event: any) {

  }

  // errors
  private _handleErrors(e: any) {
    if (!e.errors) {
      //this.error = e.error;
      return;
    }
    // custom validation errors
    _.each(e.errors, (errs, field) => {
        // take last error from array
        const errName = errs[errs.length-1];
        let err = {}; err[errName] = true;
        this.form.controls[field].setErrors(err);
    });
  }

  getErrorMessage(fieldName): string {
    if (this.form.controls[fieldName].hasError('already_in_use')) {
      return 'This ' + fieldName + ' is already in use';
    } else if (this.form.controls[fieldName].hasError('validateArrayNotEmpty')) {
      return 'You must enter a genre';
    } else if (this.form.controls[fieldName].hasError('required')) {
      return 'You must enter a value';
    }
    return null;
  }

  // http calls
  send() {
    if (this.form.invalid) {
      return;
    }

    this._saveBackup(); // this.user updated

    const temporaryEmail = /change@me/.test(this._me.email);
    const emailChanged = (this.user.email !== this._me.email) && !temporaryEmail;
    const passwordChanged = !!this.user.password;

    if (emailChanged || passwordChanged) {
      this.openEmailDialog(emailChanged, passwordChanged);
      return;
    }

    this.isSending = true;

    this.authService.updateMe(this.user).pipe(first()).subscribe(
      res => {
        this.user = res;
        this._me = this.authService.getMe();
        console.log('new user', this.user);
        this.success = true;
        this.isSending = false;
        setTimeout(() => { this.success = false; }, 5000);
      },
      err => {
        this.isSending = false;
        this._handleErrors(err.error);
      });
  }

  getCountries() {
    this.countryService.getCountries('en').pipe(first()).subscribe(res => {
        this.countries = res;
        if (this.countryControls.value !== this.currentCountry) {
          this.cityControls.setValue(null); // reset city
        }
        this.getCities();
    });
  }

  getCities() {
    if (!this.currentCountry) return;

    this.countryService.getCities(this.user.country.id).pipe(first()).subscribe(res => {
        this.cities = res;
    });
  }

  // dialogs
  openEmailDialog(emailChanged: boolean, passwordChanged: boolean) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.viewContainerRef = this.vcr;
    this.dialog = this.mdDialog.open(SettingsConfirmDialogComponent, dialogConfig);
    this.dialog.componentInstance.user = _.cloneDeep(this.user);
    this.dialog.componentInstance.emailChanged = emailChanged;
    this.dialog.componentInstance.passwordChanged = passwordChanged;

    this.dialog.afterClosed().subscribe(success => {
      this.dialog = null;
      if (success) {
        this._me = this.authService.getMe();
        _.extend(this.user, this._me);
      } else {
        // back to unchanged email and password
        this.user.email = this._me.email;
        this.user.password = null;
        this.user.current_password = null;
      }
      // update form
      this.form.controls.email.setValue(this.user.email);
      this.form.controls.password.reset();
    });
  }

  // utils
  compareFn(v1: Country | City, v2: Country | City): boolean {
    return v1.id === v2.id;
  }

  validateArrayNotEmpty(c: FormControl) {
    if (c.value && c.value.length === 0) {
      return {'validateArrayNotEmpty': true};
    }
    return null;
  }

  private _saveBackup() {
    this.user = Object.assign(this.user, this.form.value);
  }

  // initialization

  initForm() {
    this.form = this.fb.group({
      name: this.fb.control(this.user.name, [Validators.required, Validators.maxLength(50)]),
      email: this.fb.control(this.user.email, [Validators.required, Validators.email]),
      password: this.fb.control(this.user.password, [Validators.minLength(5)]),
      aliases: this.fb.array(this.user.aliases, []),
      genres: this.fb.control(this.user.genres, [this.validateArrayNotEmpty]),
      country: this.fb.control(this.user.country, []),
      city: this.fb.control(this.user.city, []),
      links: this.fb.array(this.user.links, []),
      description_en: this.fb.control(this.user.description_en, []),
      description_ru: this.fb.control(this.user.description_ru, []),
      url: this.fb.control(this.user.url, [Validators.required]),
    });

    this._formSub = this.form.valueChanges.subscribe(
      value => {
        //console.log('form value changed', this.form);
        this._saveBackup();
      }
    );

    this._aliasesSub = this.form.get('aliases').statusChanges.subscribe(
      status => this.aliasesList.errorState = status === 'INVALID'
    );

    this._genresSub = this.form.get('genres').statusChanges.subscribe(
      status => this.genresList.errorState = status === 'INVALID'
    );

    this._linksSub = this.form.get('links').statusChanges.subscribe(
      status => this.linksList.errorState = status === 'INVALID'
    );
  }

  ngOnInit(): void {
    this.authService.getMeByHttp().pipe(first()).subscribe(res => {
      this._me = res;
      this.user = _.cloneDeep(this._me);
      //this.user.email_confirmed = false;
      this.currentCountry = this.user.country;
      this.initForm();
      this.isReady = true;
      this.getCountries();
    });
  }

  ngOnDestroy(): void {
    if (this._formSub) this._formSub.unsubscribe();
    if (this._aliasesSub) this._aliasesSub.unsubscribe();
    if (this._genresSub) this._genresSub.unsubscribe();
    if (this._linksSub) this._linksSub.unsubscribe();
  }
}
