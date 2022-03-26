import { Injectable } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, throwError } from 'rxjs';

import { Player, MixFile, MixFilePath } from '../../objects/objects';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  players = new Map<number, Player>();
  active: Player;
  previousId: number;

  // active player
  private _active$: BehaviorSubject<Player> = new BehaviorSubject(null);
  get activePlayer$(): Observable<Player> {
      return this._active$.asObservable();
  }

  constructor() {
    this.active = <Player>{
      id: null,
      file: null, // this file is path
      state: 'initial',
      time: 0,
      tracking: 0,
      duration: 0
    };

  }

  getPlayer(playerID: number): Player {
    return this.players.get(playerID);
  }

  getPlayerParam(playerID: number, param: any):any {
    let pl = this.players.get(playerID);
    if (pl) {
        return pl[param];
    }
    return null;
  }

  setPlayerParam(playerID: number, param: string, value: any) {
    let pl = this.players.get(playerID);
    if (pl) {
        pl[param] = value;
    }
  }

  setActivePlayerParam(param: string, value: any) {
    if (!this.active) return;
    this.active[param] = value;
    this.updateActive(this.active);
  }

  setActivePlayerTime(value: number) {
    if (!this.active) return;
    this.active.time = value;
  }

  getMixFile(playerID: number): MixFilePath {
    let pl = this.players.get(playerID);
    if (pl) {
        return pl['file'];
    }
    return null;
  }

  init(playerID: number, reset: boolean) {
    if (this.players.has(playerID) && !reset) {
      return;
    }

    let pl = <Player>{
      id: playerID,
      file: null,
      state: 'initial',
      time: 0,
      tracking: 0
    };
    this.players.set(playerID, pl);
  }

  current(): Player {
    return this.active;
  }

  start(playerID: number) {
    if (this.active) {
      if (this.active.state === 'ended') {
        this.active.time = 0;
      }

      this.active.state = 'stop';
      // update previous player
      this.updateActive(this.active);
    }
    this.active = this.players.get(playerID);

    if (!this.active) { // not inititialized
      //showNotification();
      this.updateActive(this.active);
      return;
    }
    this.active.state = 'start';

    // записываем в историю
    /*if (this.previousId != playerID) {
      playlistService.history(playerID);
      previousId = playerID;

      // шлем на сервер прослушивание - только первый раз
      listen(playerID);
    }*/
    this.updateActive(this.active);
  }

  play(playerID: number) {
     if (!this.active) return;

     this.active.state = 'play';
     this.updateActive(this.active);
  }

  pause(playerID: number) {
    if (!this.active) return;
    this.active.state = 'pause';
    this.updateActive(this.active);
    //track(playerID);
  }

  stop() {
    if (!this.active) return;
    if (this.active.state === 'stop') {
      return;
    }

    this.active.state = 'stop';

    //track(playerID);
    this.updateActive(this.active);
  }

  finish() {
    this.active.state = 'stop';

    //track(playerID);
    this.updateActive(this.active);
  }

  listen(mixID: number) {
      /*let mix = Mix.get(mixID);
      if (!mix) return;
      // исключаем свои
      if (mix.user.id === Me.id()) return;

      // обновляем статистику микса и диджея
      Mix.listen(mixID);
      User.listen(mix.user.id);*/
  }

  count(playerID): number {
    // подсчитываем время прослушивания
    this.active.tracking++;
    return this.active.tracking;
  }

  track(playerID) {
    /*var mix = Mix.get(playerID);
    if (!mix) return;

    if (!this.active.tracking) {
        return;
    }

    // исключаем свои
    if (mix.user.id === Me.id()) return;

    // трекаем время прослушивания активного плеера
    //_trackListening(this.active.id, this.active.tracking);

    // обнуляем счетчик
    this.active.tracking = 0;*/
  }

  /*_trackListening(playerID, time) {
    Mix.track(playerID, time);
  }*/

  updateActive(player: Player) {
      this._active$.next(player);
  }

  resetSubjects() {
      this._active$.next(null);
  }

}
