import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { MixService } from '../../core/services/mix.service';
import { AuthService } from '../../core/services/auth.service';
import { Mix, User, MixLikeEvent } from '../../objects/objects';

@Component({
    selector: 'mix-bar',
    templateUrl: './mix-bar.component.html',
    styleUrls: ['./mix-bar.component.scss']
})
export class MixBarComponent implements OnInit, OnDestroy {
    @Input()mix: number;
    title: string;
    liked: boolean = false;

    private _mixObj: Mix = null;
    private _canLike: boolean = true;
    private _likesSubscription: Subscription;

    constructor(private mixService: MixService, private authService: AuthService) {}

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
            this.mixService.likedMix = { mixId: this._mixObj.id, sender: 'mixbar'}; // update stream in service
            this._mixObj = this.mixService.getMix(this.mix); // update mix
          });
      } else {
        this.mixService.like(this._mixObj.id, 0, me, 1).pipe(first())
          .subscribe(res => {
            this.liked = true;
            this._canLike = true;
            this.mixService.likedMix = { mixId: this._mixObj.id, sender: 'mixbar'}; // update stream in service
            this._mixObj = this.mixService.getMix(this.mix); // update mix
          });
      }
    }

    subscribeForLikes() {
      this._likesSubscription = this.mixService.likeUpdated$.subscribe(
        (event: MixLikeEvent) => {
          if (!event || !event.mixId || event.sender === 'mixbar') return;
          // this mix was liked somewhere on site, but not here
          if (this._mixObj.id === event.mixId) {
            this._mixObj = this.mixService.getMix(this.mix); // update mix
            this.liked = this._mixObj.liked ? (this._mixObj.liked[1] > 0.5) : false;
          }
        }
      );
    }

    ngOnInit() {
      this._mixObj = this.mixService.getMix(this.mix);
      this.title = this._mixObj.title;
      this.liked = this._mixObj.liked ? (this._mixObj.liked[1] > 0.5) : false;
      this.subscribeForLikes();
    }

    ngOnDestroy() {
      if (this._likesSubscription) this._likesSubscription.unsubscribe();
    }
}
