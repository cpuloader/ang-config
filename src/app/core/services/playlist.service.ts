import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { MixService } from './mix.service';
import { Mix, Playlist, PaginatedMixesForPlaylist, PaginatedMixesForPlaylistPlucked } from '../../objects/objects';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private apiUrl: string;

  constructor(private http: HttpClient,
              private config: ConfigService,
              private mixService: MixService) {

    this.apiUrl = this.config.getApiUrl();
  }

  getPlaylistsForUser(userId: number): Observable<Playlist[]> {
    const url: string = `${this.apiUrl}/users/${userId}/playlists`;
    return this.http.get<Playlist[]>(url);
  }

  getMixesForPlaylist(id: number, page: number, per_page: number): Observable<PaginatedMixesForPlaylistPlucked> {
    //const url: string = `${this.apiUrl}/playlists/${id}/items?full_mix_data=true&page=${page}&per_page=${per_page}`;
    const url: string = `${this.apiUrl}/playlists/${id}/items?full_mix_data=true&page=1&per_page=${per_page}`;
    return this.http.get<PaginatedMixesForPlaylist>(url).pipe(
      //map(res => this._mockMixFiles(res, page, per_page)), // test of big batches
      map(res => this._mockMixFilesSrc(res)), // test of real mix srcs
      map(res => this._cacheMixesAndPluckForPlaylist(res))
    );
  }

  private _cacheMixesAndPluckForPlaylist(res: unknown): PaginatedMixesForPlaylistPlucked {
    let newMixes: number[] = [];
    for (let mix of res['items']) {
      this.mixService.setMix(mix.item.id, mix.item);
      mix.item = mix.item.id;
      newMixes.push(mix);
    }
    res['items'] = newMixes;
    return <PaginatedMixesForPlaylistPlucked>res;
  }

  // TEST STUFF

  private _mockMixFiles(res: PaginatedMixesForPlaylist, page: number, per_page: number): PaginatedMixesForPlaylist {
    res.total_items = 300;
    res.page = page;
    res.total_pages = 100;

    let testMixJson = JSON.stringify(res.items[0]); // take first real mix and change a little
    res.items = [];
    let j = 0;
    for (let i = 0; i < per_page; i++) {
      let mix = JSON.parse(testMixJson);
      mix.id = i + (page - 1)*per_page + 1;
      mix.item.id = i + (page - 1)*per_page + 1;
      mix.item.title = `Test mix #${mix.id}`;
      mix.item.url = `mix-title-${mix.id}`;
      j++;
      if (j > 9) j = 0;
      res.items.push(mix);
    }
    return res;
  }

  private _mockMixFilesSrc(res: PaginatedMixesForPlaylist): PaginatedMixesForPlaylist {
    let j = 0;
    for (let mix of res.items) {
      mix.item.file.path[0].src = this.config.mixFilesMock[j];
      j++;
      if (j > 9) j = 0;
    }
    return res;
  }
}
