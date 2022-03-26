import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { AudioService } from '../../core/services/audio.service';
import { PlayerService } from '../../core/services/player.service';
import { MixService } from '../../core/services/mix.service';
import { Player, Mix, MixFile, MixFilePath, LastPlayer } from '../../objects/objects';


@Component({
    selector: 'flat-audio',
    template: '<div id="flatAudioElement"></div>'
})
export class AudioComponent implements AfterViewInit, OnDestroy {
    private playerSub: Subscription;
    private events: string[] = [
        'ended',
        'play',
        'playing',
        'pause',
        'waiting'
    ];

    audioElement: any;
    mixID: number;
    mixEnded: boolean = false;

    lastPlayer: LastPlayer = <LastPlayer>{
      id: undefined,
      state: undefined
    };

    private bindedAudioListener: any;

    //intervalTimer: number;

    constructor(private audioService: AudioService,
                private playerService: PlayerService,
                private mixService: MixService) {
        this.audioElement = audioService.getElement();
    }

    bindEvents() {
      for (let event of this.events) {
        this.audioElement.addEventListener(event, this.bindedAudioListener);
      }
    }

    ngAfterViewInit() {
        this.bindedAudioListener = this.onAudioEvent.bind(this);
        this.bindEvents();
        this.subscribeToPlayer();
    }

    ngOnDestroy() {
        for (let event of this.events) {
          this.audioElement.removeEventListener(event, this.bindedAudioListener);
        }

        if (this.playerSub) this.playerSub.unsubscribe();
    }

    onAudioEvent(e) {
        let type = e.type;

        switch (type) {
            case 'ended': {
                this.audioElement.currentTime = 0;
                this.mixEnded = true;
            }
            break;
            case 'playing': {
                // это если вдруг микс начал играть не с начала, после окончания предыдущего с событием ended
                if (this.mixEnded) {
                    this.mixEnded = false;
                    this.audioElement.currentTime = 0;
                }
            }
            break;
        }
        this.setState(type);
    }

    subscribeToPlayer() {
        if (this.playerSub) this.playerSub.unsubscribe();

        this.playerSub = this.playerService.activePlayer$.subscribe(pl => {
           if (!pl) return;
           //console.log('main pl sub:', pl);

           this.mixID = pl.id;

           if (!this.mixID) {
               return;
           }

           switch (pl.state) {
             case 'start': {
               this.start();
             }
             break;

             case 'play': {
               this.play();
             }
             break;

             case 'pause': {
               this.pause();
             }
             break;

             case 'stop': {
               this.pause();
             }
             break;
           }
        });
    }

    start() {
        let mix: Mix;
        let path: MixFilePath = this.playerService.getMixFile(this.mixID);

        // добавляем плеер в сервис
        this.playerService.init(this.mixID, false);

        if (path) {
            this.startPlay();
            return;
        }

        mix = this.mixService.getMix(this.mixID);
        if (!mix) {
          console.error('audio: no mix!');
          return;
        }
        //console.log('mix', _.cloneDeep(mix));
        path = this.audioService.findSourceForSub(this.audioElement, mix.file.path, { channel: mix.channel, on: mix.on_channel });
        //console.log('mix file', file);
        if (!path) {
           this.playerService.stop();
           return;
        }

        this.playerService.setPlayerParam(this.mixID, 'file', path);

        this.startPlay();
    }

    play() {
        let pl: Player = this.playerService.getPlayer(this.mixID);

        if (!pl.file) {
            this.playerService.stop();
            return;
        }

        // если пытаемся проиграть уже и так активный микс,
        // который уже установлен в audio-элементе (`src` совпадают), то сразу же запускаем play,
        // чтобы лишний раз не переинициализировать audio-элемент

        if (this.audioElement.src.endsWith(pl.file.src)) {
            var prm = this.audioElement.play();
            if (prm !== undefined) {
                prm.catch((error: any) => {
                    console.log('play same src, error and stop', error);
                    this.playerService.stop();
                });
            }

            return;
        }

        // аудио-элемент переинициализируется при каждом изменении `src` даже если данные одинаковые
        this.audioElement.setAttribute('src', pl.file.src);
        this.audioElement.setAttribute('type', pl.file.type);

        //audio.currentTime = mix.time;
        var prm = this.audioElement.play();
        if (prm !== undefined) {
            prm.catch((error: any) => {
                console.log('play new src, error and stop', error);
                this.playerService.stop();
            });
        }
    }

    pause() {
        this.audioElement.pause();
    }

    setState(state: string) {
        this.playerService.setActivePlayerParam('state', state);
    }

    startPlay() {
        this.playerService.play(this.mixID);
    }

}
