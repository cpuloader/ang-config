import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router }   from '@angular/router';
import { isPlatformBrowser, Location } from '@angular/common';
import { MatSidenav } from '@angular/material/sidenav';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from './core/services/auth.service';
import { User } from './objects/objects';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
    sidenavMode: string = 'side';
    lang: string;
    logged: boolean = false;
    username: string;

    @ViewChild('sidenav', { static: false }) sidenav: MatSidenav;

    private _userSubscription: Subscription;

    constructor(@Inject(PLATFORM_ID) private platformId: Object,
                public translate: TranslateService,
                private router: Router,
                private location: Location,
                private authService: AuthService) {

      translate.addLangs(['en', 'ru']);
      translate.setDefaultLang('en');
      if (isPlatformBrowser(this.platformId)) {
        this.lang = 'en';
      } else {
        this.lang = 'en';
      }
      translate.use(this.lang);
    }

    login() {
      if (!this.authService.isAuthorized()) {
        this.router.navigate(['/auth/login']);
      }
    }

    logout() {
      if (this.authService.isAuthorized()) {
        this.authService.logout().pipe(first()).subscribe(() => {
          this.router.navigate(['/']);
        });
      }
    }

    private _subscribeForUser() {
      this._userSubscription = this.authService.userUpdated$.subscribe(
        (user: User) => {
          if (user) {
            this.logged = true;
            this.username = this.authService.getMe().name;
            console.log('user stream', user);
          } else {
            this.logged = false;
            this.username = null;
            console.log('user stream - not logged');
          }
        });
    }

    ngOnInit() {
      if (isPlatformBrowser(this.platformId) && this.authService.isAuthorized()) {
        this.logged = true;
        this.username = this.authService.getMe().name;
        // always get fresh user
        if (!this.location.isCurrentPathEqualTo('/settings') && this.location.path().indexOf('/auth/') == -1) {
          this.authService.getMeByHttp().pipe(first()).subscribe(res => {
            console.log('fresh user loaded');
          });
        }
      } else {
        this.logged = false;
        this.username = null;
      }

      this._subscribeForUser();
    }

    ngOnDestroy() {
      if (this._userSubscription) this._userSubscription.unsubscribe();
    }
}
