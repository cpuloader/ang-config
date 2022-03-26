import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router }   from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { MixService } from '../core/services/mix.service';
import { AuthService } from '../core/services/auth.service';
import { Mix, MixLikeEvent, User } from '../objects/objects';

@Component({
    selector: 'player-panel',
    templateUrl: './player-panel.component.html',
    styleUrls: ['./player-panel.component.scss']
})
export class PlayerPanelComponent implements OnInit, OnDestroy {
    title: string;
    author: string;
    cover: string;
    liked: boolean = false;

    private _canLike: boolean = true;
    private _likesSubscription: Subscription;
    private _mixObj: Mix = null;

    constructor(private mainrouter: Router,
                private location: Location,
                private mixService: MixService,
                private authService: AuthService,
                public translate: TranslateService) {}

    OnMixChanged(mix: Mix) {
      this._mixObj = mix;
      this.title = mix.title;
      this.author = mix.user.name;
      this.cover = (mix.cover && mix.cover.thumb_squared_small) ? `url(${mix.cover.thumb_squared_small})` : 'url(/images/default_pic.png)';
      this.liked = mix.liked ? (mix.liked[1] > 0.5) : false;
    }

    openQueue() {
      if (this.location.isCurrentPathEqualTo('/queue')) {
        this.location.back();
      } else {
        this.mainrouter.navigate(['/queue']);
      }
    }

    like() {
      if (!this._canLike) return;
      if (!this.authService.isAuthorized()) return; // should show notification here
      this._canLike = false;

      let me: User = this.authService.getMe();

      if (this.liked) {
        this.mixService.dislike(this._mixObj.id, 0, me).pipe(first())
          .subscribe(res => {
            this.liked = false;
            this._canLike = true;
            this.mixService.likedMix = { mixId: this._mixObj.id, sender: 'main'}; // update stream in service
            this._mixObj = this.mixService.getMix(this._mixObj.id); // update mix
          });
      } else {
        this.mixService.like(this._mixObj.id, 0, me, 1).pipe(first())
          .subscribe(res => {
            this.liked = true;
            this._canLike = true;
            this.mixService.likedMix = { mixId: this._mixObj.id, sender: 'main'}; // update stream in service
            this._mixObj = this.mixService.getMix(this._mixObj.id); // update mix
          });
      }
    }

    subscribeForLikes() {
      this._likesSubscription = this.mixService.likeUpdated$.subscribe(
        (event: MixLikeEvent) => {
          if (!this._mixObj) return;
          if (!event || !event.mixId || event.sender === 'main') return;
          // this mix was liked somewhere on site, but not here
          if (this._mixObj.id === event.mixId) {
            this._mixObj = this.mixService.getMix(this._mixObj.id); // update mix
            this.liked = this._mixObj.liked ? (this._mixObj.liked[1] > 0.5) : false;
          }
        }
      );
    }

    ngOnInit() {
      this.subscribeForLikes();
    }

    ngOnDestroy() {
      if (this._likesSubscription) this._likesSubscription.unsubscribe();
    }
}
