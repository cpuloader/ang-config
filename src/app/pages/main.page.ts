import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from "@angular/core";
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { WindowRef } from '../core/services/window.service';
import { StorageService } from '../core/services/storage.service';
import { UsersService } from '../core/services/users.service';
import { PlayerService } from '../core/services/player.service';
import { User } from '../objects/objects';

@Component({
  selector: 'main-page',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss']
})
export class MainPage implements OnInit, OnDestroy, AfterViewInit {

  public users: User[] = [];
  public loaded: boolean = true;
  private usersSubscription: Subscription;
  public lang: string;

  constructor(private router: Router,
              private windowRef: WindowRef,
              private usersService: UsersService,
              private playerService: PlayerService,
              private storage: StorageService,
              public translate: TranslateService) {

    this.lang = this.translate.currentLang;
  }

  langChange() {
    if (this.translate.currentLang === 'ru') this.lang = 'en';
    else this.lang = 'ru';
    this.translate.use(this.lang);
    this.storage.set('userlang', this.lang);

    this.translate.get('GREET').subscribe((res: string) => {
        console.log(res);
    });
  }

  ngAfterViewInit(): void {
    console.log('MainPage ngAfterViewInit');
  }

  ngOnInit(): void {
    console.log('MainPage ngOnInit');
  }

  ngOnDestroy(): void {
    console.log('MainPage ngOnDestroy');
    //this.usersSubscription.unsubscribe();
  }
}
