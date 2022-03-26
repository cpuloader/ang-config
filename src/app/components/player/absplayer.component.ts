import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlayerService } from '../../core/services/player.service';
import { AudioService } from '../../core/services/audio.service';

@Component({
  selector: 'abs-player',
  template: '<div></div>'
})
export class AbsPlayerComponent implements OnInit, OnDestroy {
    static events: string[] = [
      'canplay',
      'canplaythrough',
      'durationchange',
      'emptied',
      'ended',
      'loadeddata',
      'loadedmetadata',
      'pause',
      'play',
      'playing',
      'progress',
      'ratechange',
      'timeupdate',
      'volumechange',
      'waiting'
    ];

    constructor(protected playerService: PlayerService, protected audioService: AudioService) {}

    ngOnInit() {
        //console.log('abs player component init');
    }

    ngOnDestroy() {
       //console.log('abs player component destroy');
    }
}
