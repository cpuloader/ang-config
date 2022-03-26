import { Component, Input, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AbsPlayerComponent } from './absplayer.component';
import { AudioService } from '../../core/services/audio.service';
import { PlayerService } from '../../core/services/player.service';
import { MixService } from '../../core/services/mix.service';
import { Mix, Player } from '../../objects/objects';

@Component({
    selector: 'mix-bar-player',
    templateUrl: './mix-bar-player.component.html',
    styleUrls: ['./mix-bar-player.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MixBarPlayerComponent extends AbsPlayerComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input()mix: number;
    private mixObj: Mix = null;
    private playerID: number;
    private playerElement: any; // main html audio
    private audioElement: any; // this player html audio

    currentTime: number = 0;
    currentState: string = 'initial';
    duration: number = 0;

    isPlaying: boolean = false; // playing or not
    isActive: boolean = false;
    private isPreloaded: boolean = false;
    private eventsBinded: boolean = false;
    private playbackState: string = 'initial';

    private bindedAudioListener: any;
    private bindedPlayerListener: any;

    private playerSub: Subscription;

    constructor(private mixService: MixService,
                protected playerService: PlayerService,
                private ref: ChangeDetectorRef,
                protected audioService: AudioService) {
      super(playerService, audioService);

    }

    ngAfterViewInit() {
      if (!this.mix) return;
      this.mixObj = this.mixService.getMix(this.mix);
      this.onMixChanged();
    }

    ngOnInit() {
      super.ngOnInit();
      this.bindedAudioListener = this.onAudioEvent.bind(this);
      this.bindedPlayerListener = this.onPlaybackEvent.bind(this);
    }

    ngOnDestroy() {
      super.ngOnDestroy();

      this.unbindPlaybackEvents();

      this.audioElement = null;
      this.playerElement = null;
      if (this.playerSub) this.playerSub.unsubscribe();
    }

    // init player here
    onMixChanged() {
      let pl = this.playerService.getPlayer(this.mix);

      this.currentTime = (pl && pl.time) ? pl.time : 0;
      this.currentState = (pl && pl.state) ? pl.state : 'initial';
      this.duration = (pl && pl.duration) ? pl.duration : 0;

      this.playerElement = this.audioService.getElement();

      this.playerID = this.mix;

      // это значит что на страницу подгрузился микс, играющий сейчас в плеере
      if (this.playerService.current() && this.playerService.current().id === this.playerID) {
        this.isActive = true;
      }

      // добавляем плеер в сервис
      this.playerService.init(this.playerID, false);

      this.isActive = ((this.currentState !== 'stop' && this.currentState !== 'initial'))
      this.playbackState = this.currentState;
      this.checkPlayback(this.playbackState);

      // подписываемся на эвенты
      if (this.isActive) {
          this.bindPlaybackEvents();
      }

      this.subscribeToPlayer();
    }

    subscribeToPlayer() {
      if (this.playerSub) this.playerSub.unsubscribe();

      this.playerSub = this.playerService.activePlayer$.subscribe(pl => {
        if (!pl || pl.id !== this.playerID || !pl.state) return;
        //console.log('mix-bar sub for ' + this.playerID + ': ', pl);

        if (this.playbackState === pl.state) {
          return;
        }

        this.playbackState = pl.state;
        this.checkPlayback(this.playbackState);

        switch (pl.state) {
          case 'start': { this.play(); } break;
          case 'play': { this.play(); } break;
          case 'pause': { this.pause(); } break;
          case 'stop': { this.stop(); } break;
          case 'ended': { this.end(); } break;
        }
        //console.log('mix-bar state for ' + this.playerID + ': ', this.isPlaying);

        this.ref.detectChanges();
      });
    }

    checkPlayback(state: string) {
      switch(state) {
        case 'initial':
        case 'canplay':
        case 'emptied':
        case 'ended':
        case 'pause':
        case 'stop':
        case 'play': // ?
        case 'waiting':
          this.isPlaying = false;
          break;
        case 'playing':
          this.isPlaying = true;
          break;
        default:
          break;
      }
    }

    // ФУНКЦИИ КОНТРОЛЯ ПРОИГРЫВАНИЯ
    toggle() {
      switch (this.playbackState) {
        case 'playing': {
          //pause();
          this.playerService.pause(this.playerID);
        }
        break;

        case 'ended': {
          this.repeat();
        }
        break;

        default: {
          this.onToggle(); // тут debounce, потому что если быстро переключать, кнопка зацикливается в Firefox
        }
      }
    }

    // плеер включил человек
    onToggle() {
      //pause();
      this.start();
    }

    start() {
      this.playerService.start(this.playerID);
    }

    stop() {
      this.isActive = false;
    }

    play() {
      this.isActive = true;

      // получаем текущее время из сервиса
      this.currentTime = this.playerService.getPlayerParam(this.playerID, 'time') || 0;

      this.updateProgress(-1);
      this.bindPlaybackEvents();
    }

    pause() {}

    repeat() {}

    end() {
      this.playerService.track(this.playerID);
    }

    initializeMetadata() {
      this.initializeAudio();
      this.preloadMetadata();
    }

    initializeAudio() {
      this.audioElement = this.audioService.createElement();

      this.audioElement.addEventListener('canplaythrough', this.bindedAudioListener);
      this.audioElement.addEventListener('loadedmetadata', this.bindedAudioListener);
      this.audioElement.addEventListener('durationchange', this.bindedAudioListener);
    }

    preloadMetadata() {
      var mix = this.mixService.getMix(this.playerID);

      if (this.isPreloaded) {
          return;
      }

      this.isPreloaded = true;
      this.audioService.loadMetadata(this.audioElement, mix.file.path);
    }

    bindPlaybackEvents() {
      if (this.eventsBinded) {
        return;
      }

      this.eventsBinded = true;

      for (let event of AbsPlayerComponent.events) {
        this.playerElement.addEventListener(event, this.bindedPlayerListener);
      }
    }

    unbindPlaybackEvents() {
      for (let event of AbsPlayerComponent.events) {
        this.playerElement.removeEventListener(event, this.bindedPlayerListener);
      }

      if (this.audioElement) {
        this.audioElement.removeEventListener('canplaythrough', this.bindedAudioListener);
        this.audioElement.removeEventListener('loadedmetadata', this.bindedAudioListener);
        this.audioElement.removeEventListener('durationchange', this.bindedAudioListener);
      }
    }

    onPlaybackEvent(e) {
      let eventType = e.type;

      if (!this.isActive) {
        return;
      }

      switch (eventType) {
        case 'canplaythrough': {
          // это хак для Edge, без него состояние `waiting` не меняется, иконка не меняется и анимашечка загрузки не останавливается
          this.playbackState = 'playing';
          this.checkPlayback(this.playbackState);
        }
        break;

        case 'durationchange':
        case 'loadedmetadata': {
          this.duration = this.playerElement.duration;

          this.updateDuration();
        }
        break;

        case 'timeupdate': {
          if (this.playbackState !== 'playing') {
            return;
          }

          this.currentTime = this.playerElement.currentTime;

          this.updateProgress(-1);
        }
        break;
      }
    }

    onAudioEvent(e) {
      let eventType = e.type;

      switch (eventType) {
        case 'durationchange':
        case 'loadedmetadata': {
          this.duration = this.audioElement.duration || this.duration;
          this.updateDuration();
        }
        break;
      }
    }


    updateProgress(time: number) {
      let left = 0,
          right = 0,
          width = 0;

      time = (time >= 0) ? time : this.currentTime;

      //this.playerService.setActivePlayerParam('time', time); // uncomment this!!

      // если длина еще не успела подхватиться из сервиса
      if (this.duration === 0) {
          this.duration = this.playerService.getPlayerParam(this.playerID, 'duration');
      }
    }

    updateDuration() {
      // оповещаем сервис
      this.playerService.setActivePlayerParam('duration', this.duration);
    }

}
