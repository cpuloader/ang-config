import { Component, OnInit, Input, Output } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { TranslateService } from '@ngx-translate/core';
import { AudioService } from '../core/services/audio.service';
import { StorageService } from '../core/services/storage.service';


@Component({
    selector: 'volume',
    templateUrl: './volume.component.html',
    styleUrls: ['./volume.component.scss']
})
export class VolumeComponent implements OnInit {
    private playerElement: any = null;
    private _value: number = 100;

    get value(): number {
      return this.playerElement ? this.playerElement.volume*100 : 100;
    }

    set value(v: number) {
      if (!this.playerElement) return;
      this.playerElement.volume = v / 100;
      this.storageService.set('player-volume', v);
    }

    constructor(public translate: TranslateService,
                private audioService: AudioService,
                private storageService: StorageService) {

      let vol: string = this.storageService.get('player-volume');
      this.playerElement = this.audioService.getElement();
      if (vol) {
        this.playerElement.volume = parseInt(vol, 10) / 100;
        this._value = parseInt(vol, 10);
      }
    }

    OnValueChange(e: MatSliderChange) {
      this.value = e.value;
    }

    toggle() {
      if (this.value > 0) {
        this._value = this.value;
        this.value = 0;
      } else {
        this.value = this._value;
      }
      console.log('toggle', this.value, this._value);
    }

    ngOnInit() {}
}
