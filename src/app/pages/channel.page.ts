import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute }   from '@angular/router';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

import { WindowRef } from '../core/services/window.service';
import { MixService } from '../core/services/mix.service';
import { PlaylistService } from '../core/services/playlist.service';
import { Mix, PaginatedMixesForPlaylistPlucked, SimpleMixRef, MixLikeEvent } from '../objects/objects';

const per_page: number = 100;

@Component({
  selector: 'channel-page',
  templateUrl: './channel.page.html',
  styleUrls: ['./channel.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChannelPage implements OnInit, OnDestroy {
  id: string;
  mixes: SimpleMixRef[] = null;
  loaded: boolean = false;
  private _mixesSubscription = new Subscription();
  private _likesSubscription: Subscription;

  private _loadedPages = new Set<number>(); // pagination flags
  private _maxPage: number = 1;

  @ViewChild('mixesList', { static: true }) mixesList: CdkVirtualScrollViewport;

  constructor(private route: ActivatedRoute,
              private windowRef: WindowRef,
              private mixService: MixService,
              private playlistService: PlaylistService,
              private changeRef: ChangeDetectorRef,
              public translate: TranslateService) {

  }

  loadMixes(): void {
    this._loadedPages.add(1);
    this._mixesSubscription.add(this.playlistService.getMixesForPlaylist(1/*this.id*/, 1, per_page).subscribe(
        (res: PaginatedMixesForPlaylistPlucked) => {
          if (this.loaded) return;
          this.mixes = new Array<SimpleMixRef>(res.total_items);
          let p = (res.total_items >= per_page) ? per_page : res.total_items;
          for (let i = 0; i < p; i++) {
            this.mixes[i] = <SimpleMixRef>{ id: res.items[i].item, loaded: true };
            console.log(this.mixes);
          }
          if (p < res.total_items) {
            for (let i = per_page; i < res.total_items; i++) {
              this.mixes[i] = <SimpleMixRef>{ id: undefined, loaded: false };
            }
          }
          this.loaded = true;
          this._maxPage = Math.ceil(res.total_items/per_page);
          this.changeRef.detectChanges();
        },
        err => {
          console.log('error!', err);
        }
    ));
  }

  loadMoreMixes(page: number): void {
    //console.log('loadMoreMixes, page=', page);
    this._loadedPages.add(page);
    this._mixesSubscription.add(this.playlistService.getMixesForPlaylist(1/*this.id*/, page, per_page).subscribe(
        (res: PaginatedMixesForPlaylistPlucked) => {
          if (!this.loaded) return;
          const offset: number = (page-1)*per_page;
          const end: number = Math.min(offset + per_page, res.total_items);
          //console.log('offset', offset, 'end', end);
          let mixes = this.mixes.slice(); // copy for change detector
          let j = 0;
          for (let i = offset; i < end; i++) {
            mixes[i] = <SimpleMixRef>{ id: res.items[j].item, loaded: true };
            j++;
          }
          this.mixes = mixes;
          this.loaded = true;
          this.changeRef.detectChanges();
          //console.log('new mixes', this.mixes);
        },
        err => {
          console.log('error!', err)
        }
    ));
  }

  onScroll(el: number) {
    if (el === 0 || !this.mixes) return;
    if (this.mixes.length > el+50) { // look for 50 mixes forward
      el += 50;
    }
    let m: SimpleMixRef = this.mixes[el];
    if (m && !m.loaded) {
      let p = Math.floor(el/per_page) + 1;
      //console.log('new page reached', p, 'top el+50', el);
      if (p > this._maxPage) {
        return;
      }
      if (!this._loadedPages.has(p)) {
        this.loadMoreMixes(p);
      }
    }
  }

  subscribeForLikes() {
    this._likesSubscription = this.mixService.likeUpdated$.subscribe(
      (event: MixLikeEvent) => {
        if (!event || !event.mixId) return;
        if (!this.mixes) return;
        const index = this.mixes.findIndex(m => { return m.id === event.mixId });
        if (index > -1) {
          setTimeout(() => { // mix must be updated inside list element component before all list updating, so delay here
            this.mixes = this.mixes.slice(); // copy for change detector
            this.changeRef.detectChanges();
          }, 100);
        }
      }
    );
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('channelId'); // maybe switchMap here
    console.log('params:', this.id);
    this.loadMixes();
    this.subscribeForLikes();
  }

  ngOnDestroy(): void {
    this._mixesSubscription.unsubscribe();
    if (this._likesSubscription) this._likesSubscription.unsubscribe();
  }
}
