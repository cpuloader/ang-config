import { environment } from '../../../environments/environment';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { WindowRef } from './window.service';

var DEBUG: boolean;

if (environment.production) {
    DEBUG = false;
} else { DEBUG = true; }

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
    constructor(@Inject(PLATFORM_ID) private platformId: Object,
                private windowRef: WindowRef) {}

    debug: boolean = DEBUG;

    getHost(): string {
        return isPlatformBrowser(this.platformId) ? this.windowRef.nativeWindow.location.host : 'localhost';
    }

    getWSScheme(): string {
        if (isPlatformBrowser(this.platformId)) {
            return this.windowRef.nativeWindow.location.protocol == 'https:' ? 'wss:' : 'ws:';
        }
        return 'http:'
    }

    getApiUrl(): string {
        if (isPlatformBrowser(this.platformId)) {
            return this.windowRef.nativeWindow.location.protocol + '//' + this.getHost() + '/api';
        }
        return 'http://' + this.getHost() + '/api';
    }

    mixFilesMock: string[] = [
      'https://flat.audio/mixes/10451/3e562b028be0c03aeb059e70a0d69abc5503ef57_128.mp3',
      'https://flat.audio/mixes/11444/94ea9c3f83c3f5f41d15ea5ed9919a828efc40dc_128.mp3',
      'https://flat.audio/mixes/12102/e07646d0606efe03d45c92cc4de73925619201db_128.mp3',
      'https://flat.audio/mixes/8901/b0204f2d7f1f191ef9b381a8a0388235d0620007_128.mp3',
      'https://flat.audio/mixes/2864/190311d212bdeae71243b49ccf61787e99055b84_128.mp3',
      'https://flat.audio/mixes/623/fbad373b1df3cbf9d304273a6cefee916dccd816_128.mp3',
      'https://flat.audio/mixes/3358/2d6d692b5f701df4a558c5e066feb966e4c150f4_128.mp3',
      'https://flat.audio/mixes/7240/74a374ca442e65be2b4250a787351a02ae35c677_128.mp3',
      'https://flat.audio/mixes/13901/841bacfdebfe0528f64125e794e30dc1bd7d05fd_128.mp3',
      'https://flat.audio/mixes/14276/ede21d8dd25cb609b4edb17cfee387689141915b_128.mp3',
      'https://flat.audio/mixes/3709/f2d6bbb941170f39249874908ffe6e11d91e1268_128.mp3',
      'https://flat.audio/mixes/4590/cff0f903a4d929e9b6b70bfa98da2e490126a428_128.mp3',
      'https://flat.audio/mixes/7663/9cf806d7b4d4e24d15b646c8505e650f4405f0b6_128.mp3',
      'https://flat.audio/mixes/8538/ee7d91446a2bf30ff6d6183dd4a37dbb6186d636_128.mp3',
      'https://flat.audio/mixes/2877/0d957c15485d36fc389fbb0e4fbc86fdb71378bb_128.mp3',
      'https://flat.audio/mixes/3796/ee308a3ca6821620045580d08dcfb319e4c96661_128.mp3',
      'https://flat.audio/mixes/6698/bbed63f8ea428335dcc8c76b04a68738f78aa657_128.mp3',
      'https://flat.audio/mixes/3891/188d9ee32d4a04ab97d09eb24ada251bb59f45ea_128.mp3',
      'https://flat.audio/mixes/6551/51e0539a8d2be2ca3b4f6eccbc4e50ce2ee4e8c5_128.mp3',
      'https://flat.audio/mixes/6322/6fb171dfbada41fb0bc42ce23dd8d249df91d701_128.mp3'
    ];
}
