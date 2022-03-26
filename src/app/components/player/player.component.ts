import { Component, OnInit, OnDestroy, Output, EventEmitter, ElementRef, Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
//import * as _ from 'lodash-es';

import { AbsPlayerComponent } from './absplayer.component';
import { PlayerService } from '../../core/services/player.service';
import { AudioService } from '../../core/services/audio.service';
import { MixService } from '../../core/services/mix.service';
import { Mix, Player, ClientRect } from '../../objects/objects';
import { secondsToTime } from '../../utils/utils';

@Component({
    selector: 'player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss']
})
export class PlayerComponent extends AbsPlayerComponent implements OnInit, OnDestroy {
    @Output()mixChanged = new EventEmitter<Mix>();
    private mixObj: Mix = null;

    private playerID: number;
    private playerElement: any; // main html audio
    private audioElement: any; // this player html audio

    private currentState: string = 'initial';
    private currentTime: number = 0;
    private duration: number = 0;

    title: string;
    outCurrentTime: string = null;
    outDuration: string = null;

    isPlaying: boolean = false; // playing or not
    isActive: boolean = false;
    isSeeking: boolean = false;
    isPreloaded: boolean = false;
    playbackState: string = 'initial';

    private player: Player;
    private playerSub: Subscription;
    private bindedAudioListener: any;
    private bindedPlayerListener: any;
    private eventsBinded: boolean = false;

    private seekbarOffsetWidth: number = 0;
    private seekbarOffsetLeft: number = 0;
    // seekbar blocks
    private seekbarBlock: any;
    private seekbarTotal: any;
    private seekbarBuffer: any;
    private seekbarProgress: any;
    private seekbarOverlay: any;
    private seekingTotal: any;
    private seekingBuffer: any;
    private seekingProgress: any;
    // seekbing bar listeners
    //private bindedSeekbarMouseEnterListener: any;

    constructor(protected playerService: PlayerService,
                protected audioService: AudioService,
                private mixService: MixService,
                private el: ElementRef,
                private renderer: Renderer2,
                public translate: TranslateService) {
      super(playerService, audioService);
    }

    ngOnInit() {
      super.ngOnInit();

      this.playerElement = this.audioService.getElement();

      this.bindedAudioListener = this.onAudioEvent.bind(this);
      this.bindedPlayerListener = this.onPlaybackEvent.bind(this);

      this.subscribeToPlayer();
    }

    ngOnDestroy() {
      super.ngOnDestroy();

      this.unbindPlaybackEvents();

      this.audioElement = null;
      this.playerElement = null;

      this.seekbarBlock = null;
      this.seekbarTotal = null;
      this.seekbarBuffer = null;
      this.seekbarProgress = null;
      this.seekbarOverlay = null;
      this.seekingTotal = null;
      this.seekingBuffer = null;
      this.seekingProgress = null;

      if (this.playerSub) this.playerSub.unsubscribe();
    }

    // subscribe to player changes
    subscribeToPlayer() {
        if (this.playerSub) this.playerSub.unsubscribe();

        this.playerSub = this.playerService.activePlayer$.subscribe(pl => {
            if (!pl || !pl.state ||! pl.id) return;
            //console.log('player update', pl);

            if (this.playbackState === pl.state) {
              return;
            }

            if (!this.playerID || (this.playerID && pl.id !== this.playerID && pl.state === 'start')) {
              console.log('!!!!!!!! new player start', pl);
              this.onMixChanged(pl);
            } else if (pl.id !== this.playerID) {
              // signal from another player (old)
              return;
            }

            this.player = pl;
            this.playbackState = pl.state;

            switch(pl.state) {
              case 'initial':
              case 'canplay':
              case 'emptied':
              case 'ended':
              case 'pause':
              case 'waiting':
                this.isPlaying = false;
                break;
              case 'play':
              case 'playing':
                this.isPlaying = true;
                break;
              default:
                break;
            }
        });
    }

    // init player here
    onMixChanged(pl: Player) {
      this.mixObj = this.mixService.getMix(pl.id);
      if (!this.mixObj) return;

      this.mixChanged.emit(this.mixObj); // send mix to panel

      this.title = this.mixObj.title;

      this.currentTime = (pl && pl.time) ? pl.time : 0;
      this.currentState = (pl && pl.state) ? pl.state : 'initial';
      this.duration = (pl && pl.duration) ? pl.duration : 0;

      /*if (this.previousID) {
          // блокируем чтобы не взялось время из предыдущего плеера
          playerService.timeBlock('blocked');
          $timeout(function() { playerService.timeBlock('unblocked'); }, 100);
      }*/

      this.playerID = pl.id;

      // это значит что на страницу подгрузился микс, играющий сейчас в плеере
      if (this.playerService.current() && this.playerService.current().id === this.playerID) {
        this.isActive = true;
      }

      // добавляем плеер в сервис
      this.playerService.init(this.playerID, false);

      this.isActive = ((this.currentState !== 'stop' && this.currentState !== 'initial'))
      this.playbackState = this.currentState;

      // подписываемся на эвенты
      if (this.isActive) {
          this.bindPlaybackEvents();
      }

      //this.bindElementEvents();

      /*if (config.preload) {
          initializeMetadata();
      }*/

      this.initializeSeekbar();
      this.drawCurrentTime();
      this.drawDuration();
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
      if (!this.playerID) return;

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

    onWindowResize() {
      this.resizeSeekbar();
      this.updateProgress(-1);
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

          this.drawDuration();
          this.updateDuration();
          this.resizeSeekbar();
        }
        break;

        case 'loadeddata': {
          //this.setCurrentTime(currentTime);
        }
        break;

        case 'timeupdate': {
          //this.countTime();

          if (this.playbackState !== 'playing') {
            return;
          }

          if (this.isSeeking) {
            return;
          }

          this.currentTime = this.playerElement.currentTime;

          this.updateProgress(-1);
        }
        break;

        case 'progress': {
          this.readBuffer();
        }
        break;

        case 'ended': {
          // foo
        }
        break;
      }
    }

    onAudioEvent(e) {
      let eventType = e.type;

      switch (eventType) {
        case 'canplaythrough': {
          this.onWindowResize();
        }
        break;

        case 'durationchange':
        case 'loadedmetadata': {
          this.duration = this.audioElement.duration || this.duration;

          this.updateDuration();
          this.resizeSeekbar();
        }
        break;
      }
    }

    OnDragEvent(event: ClientRect) {
      if (!event.name) return;
      switch(event.name) {
        case 'dragStart.mainPlayer': this.onSeekbarDragStart(event);
          break;
        case 'dragMove.mainPlayer': this.onSeekbarDragMove(event);
          break;
        case 'dragEnd.mainPlayer': this.onSeekbarDragEnd(event);
          break;
      }
    }

    onSeekbarDragStart(event: ClientRect) {
      this.resizeBuffer(100); // прячем буффер
      this.isSeeking = true;
      this.onSeekbarDragMove(event);
    }

    onSeekbarDragMove(event: ClientRect) {
      let left = Math.max(0, Math.min(event.left, this.seekbarOffsetWidth));
      let time = left / this.seekbarOffsetWidth * this.duration;
      this.currentTime = time;
      this.updateProgress(time);
    }

    onSeekbarDragEnd(event: ClientRect) {
      this.isSeeking = false;
      this.setCurrentTime(this.currentTime);

      if (this.playbackState !== 'playing') {
          this.start();
      }

      this.updateProgress(-1);
    }

    setCurrentTime(time: number) {
      this.playerElement.currentTime = this.currentTime = time;
    }

    initializeSeekbar() {
      this.seekbarBlock = this.el.nativeElement.querySelector('#playerSeekbarBlock');
      this.seekbarTotal = this.el.nativeElement.querySelector('#playerSeekbarTotal');
      this.seekbarBuffer = this.el.nativeElement.querySelector('#playerSeekbarBuffer');
      this.seekbarProgress = this.el.nativeElement.querySelector('#playerSeekbarProgress');
      this.seekbarOverlay = this.el.nativeElement.querySelector('#playerOverlayBlock');
      this.seekingTotal = this.el.nativeElement.querySelector('#playerSeekingTotal');
      this.seekingBuffer = this.el.nativeElement.querySelector('#playerSeekingBuffer');
      this.seekingProgress = this.el.nativeElement.querySelector('#playerSeekingProgress');
    }

    resizeSeekbar() {
      // TODO: if not server-side rendering
      let rect = this.seekbarBlock.getBoundingClientRect();
      if (rect) {
        this.seekbarOffsetWidth = rect.width;
        this.seekbarOffsetLeft = rect.left;
      }
    }

    readBuffer() {
      let buffer = this.playerElement.buffered,
        length = buffer.length,
        value,
        i;

      if (this.isSeeking) {
          return;
      }

      for (let i = 0; i < length; i++) {
          value = Math.round(buffer.end(i) / this.duration * 100);
      }

      if (value >= 100 || value === undefined) {
          this.resizeBuffer(100);
          return;
      }

      if (value > (this.currentTime / this.duration)) {
          // ресайзим строку буфера
          this.resizeBuffer(value);
      }
    }

    resizeBuffer(value) {
      this.renderer.setStyle(this.seekbarBuffer, 'width', `${Math.round(value)}%`);
    }

    updateProgress(time: number) {
      let width = 0;

      time = (time >= 0) ? time : this.currentTime;

      this.playerService.setActivePlayerTime(time);

      // если элемент прогресса не нарисовался, берем длину элемента
      if (time > 0 && this.seekbarOffsetWidth === 0) {
          this.seekbarOffsetWidth = this.seekbarTotal.getBoundingClientRect().width;
      }
      // если длина еще не успела подхватиться из сервиса
      if (this.duration === 0) {
          this.duration = this.playerService.current().duration || 0;
          this.drawDuration();
      }

      // ширина слева
      width = time / this.duration * 100; // получили прогресс в процентах
      width = width * this.seekbarOffsetWidth / 100; // пересчитали прогресс в пикселах
      width = Math.round(width); // округляем, чтобы не было дробей
      // проверяем длину буфера
      let w = this.seekbarBuffer.style.width;
      let blockBufferLength = w ? w.substr(0, w.length - 1) : 101;
      if (blockBufferLength < 100) {
          this.readBuffer();
      }

      this.renderer.setStyle(this.seekbarProgress, 'width', `${width}px`);

      this.drawCurrentTime();
    }

    updateDuration() {
      // оповещаем сервис
      this.playerService.setActivePlayerParam('duration', this.duration || 0);
      this.drawDuration();
    }

    drawCurrentTime() {
      this.outCurrentTime = this.currentTime ? secondsToTime(this.currentTime) : '0:00';
    }

    drawDuration() {
      this.outDuration = this.duration ? secondsToTime(this.duration) : '0:00';
    }
}
