import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { Router }   from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { WindowRef } from '../core/services/window.service';
import { MixService } from '../core/services/mix.service';
import { PlaylistService } from '../core/services/playlist.service';
import { AuthService } from '../core/services/auth.service';
import { User, Mix, SimpleMixRef, MixLikeEvent } from '../objects/objects';

const per_page: number = 100;

@Component({
  selector: 'queue-page',
  templateUrl: './queue.page.html',
  styleUrls: ['./queue.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueuePage implements OnInit, OnDestroy {
  mixes: SimpleMixRef[] = null;
  loaded: boolean = false;

  constructor(private router: Router,
              private windowRef: WindowRef,
              private authService: AuthService,
              private mixService: MixService,
              private playlistService: PlaylistService,
              private changeRef: ChangeDetectorRef,
              public translate: TranslateService) {

  }



  ngOnInit(): void {
    let me: User = this.authService.getMe();
    console.log('me', me);
    if (!me) return;
    this.playlistService.getPlaylistsForUser(me.id).pipe(first()).subscribe(res => {
      console.log('playlists', res);
      if (!res.length) return;
      //this.getFirstPlaylist(res[0].id);
    });
  }

  ngOnDestroy(): void {
  }
}
