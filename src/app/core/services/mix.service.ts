import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as _ from 'lodash-es';

import { Mix, PaginatedMixes, PaginatedMixesPlucked, User, MixLikeEvent, MixLikeResult } from '../../objects/objects';
import { ConfigService } from './config.service';
import { CacheService } from './cache.service';
import { HeadersService } from './headers.service';
import { addObjectAttrs } from '../../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class MixService {
  private apiUrl: string;
  mixCache: any; // all mixes dictionary mapped by id, stores forever, you must update it on every mix load
  //private mixResponsesCache: any; // cached responses (use Service Worker and native browser Cache maybe?)

  // stream of likes
  private _lastLike$: BehaviorSubject<MixLikeEvent> = new BehaviorSubject(null);
  get likeUpdated$(): Observable<MixLikeEvent> {
      return this._lastLike$.asObservable();
  }
  set likedMix(event: MixLikeEvent) {
      this._lastLike$.next(event);
  }

  constructor(private http: HttpClient,
              private cacheService: CacheService,
              private headers: HeadersService,
              private config: ConfigService) {

    this.apiUrl = this.config.getApiUrl();
    this.mixCache = this.cacheService.create('mixes', null);
    //this.mixResponsesCache = this.cacheService.create('mixes-for-channel', null);
  }

  // MIX CACHING
  getMix(id: number): Mix {
    return this.mixCache.get(`${id}`);
  }

  setMix(id: number, mix: Mix): Mix {
    let cached: Mix = this.mixCache.get(`${id}`);
    if (cached) {
      // так как covers присылаются разные для разных типов объектов, добавляем их отдельно, чтобы не затирались
      let coversField = cached.cover;
      let audioPreview = cached.file.preview;
      let videoPreview = cached.file.video_preview;
      let mixFileName = cached.file.name;

      mix = _.extend(cached, mix);
      addObjectAttrs(mix, 'cover', coversField);

      // сохранение превью от перезаписывания пустым полем
      if (mix.file.preview === undefined) {
          mix.file.preview = audioPreview;
      }

      if (mix.file.video_preview === undefined) {
          mix.file.video_preview = videoPreview;
      }

      if (mix.file.name === undefined) {
          mix.file.name = mixFileName;
      }
    }
    this.mixCache.put(`${id}`, mix);
    return mix;
  }

  // MIX LOADING

  getMixesForChannel(channel: string, page: number, per_page: number): Observable<PaginatedMixesPlucked> {
    //const url: string = `${this.apiUrl}/mixes/public?channels[]=${channel}&playlist=true&page=${page}&per_page=${per_page}`;
    const url: string = `${this.apiUrl}/mixes/public?channels[]=${channel}&playlist=true&page=1&per_page=${per_page}`;
    return this.http.get<PaginatedMixes>(url).pipe(
      //map(res => this._mockMixFiles(res, page, per_page)), // test of big batches
      map(res => this._mockMixFilesSrc(res)), // test of real mix srcs
      map(res => this._cacheMixesAndPluck(res))
    );
  }

  private _cacheMixesAndPluck(res: unknown): PaginatedMixesPlucked {
    let newMixes: number[] = [];
    for (let mix of res['items']) {
      this.setMix(mix.id, mix);
      newMixes.push(mix.id);
    }
    res['items'] = newMixes;
    return <PaginatedMixesPlucked>res;
  }

  // MIX LIKING

  like(mixId: number, mixAt: number, user: User, rate: number): Observable<MixLikeResult> {
    const url: string = `${this.apiUrl}/mixes/${mixId}/likes`;
    const body: Object = {
      mix_id: mixId,
      mix_at: mixAt,
      target: 'likes',
      weight: rate
    };
    return this.http.post<MixLikeResult>(url, body, { headers: this.headers.makeCSRFHeader() }).pipe(
      map(res => this._likeSuccess(mixId, res, user, false, rate))
    );
  }

  dislike(mixId: number, mixAt: number, user: User): Observable<MixLikeResult> {
    const url: string = `${this.apiUrl}/mixes/${mixId}/likes?mix_at=${mixAt}`;
    return this.http.delete<MixLikeResult>(url,{ headers: this.headers.makeCSRFHeader() }).pipe(
      map(res => this._likeSuccess(mixId, res, user, true, null))
    );
  }

  private _likeSuccess(mixId: number, data: MixLikeResult, user: User, isLiked: boolean, rate: number): MixLikeResult {
    let mix: Mix = this.getMix(mixId);
    let userId: number = user.id;

    let likes: number = mix.statistics.likes;
    let users: User[] = mix.liked_users;

    // mix users update
    if (isLiked) {
      likes--;
      if (users) {
          let index = users.findIndex(i => { return i.id === user.id; });
          if (index > -1 ) users.splice(index, 1);
      }
    } else {
        likes++;
        if (users) {
            let index = users.findIndex(i => { return i.id === user.id; });
            if (index > -1 ) users.splice(index, 1);
            users.unshift(user);
        }
    }
    // mix update
    mix.statistics.likes = likes;
    mix.statistics.likes_score = data.score;
    mix.liked = isLiked ? [false, 0] : [true, rate];

    this.mixCache.put(`${mix.id}`, mix);
    return data;
  }

  // TEST STUFF

  private _mockMixFiles(res: PaginatedMixes, page: number, per_page: number): PaginatedMixes {
    res.total_items = 300;
    res.page = page;
    res.total_pages = 100;

    let testMixJson = JSON.stringify(res.items[0]); // take first real mix and change a little
    res.items = [];
    let j = 0;
    for (let i = 0; i < per_page; i++) {
      let mix = JSON.parse(testMixJson);
      mix.id = i + (page - 1)*per_page + 1;
      mix.title = `Test mix #${mix.id}`;
      mix.url = `mix-title-${mix.id}`;
      j++;
      if (j > 9) j = 0;
      res.items.push(mix);
    }
    return res;
  }

  private _mockMixFilesSrc(res: PaginatedMixes): PaginatedMixes {
    if (!res['items']) return res;

    let j = 0;
    for (let mix of res.items) {
      mix.file.path[0].src = this.config.mixFilesMock[j];
      j++;
      if (j > 9) j = 0;
    }
    return res;
  }
}
