import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

import { ConfigService }       from './services/config.service';
import { WindowRef }           from './services/window.service';
import { StorageService }      from './services/storage.service';
import { CacheService }        from './services/cache.service';
import { UtilsService }        from './services/utils.service';
import { HeadersService }      from './services/headers.service';
import { AuthService }         from './services/auth.service';
import { UsersService }        from './services/users.service';
import { PlayerService }       from './services/player.service';
import { MixService }          from './services/mix.service';
import { AudioService }        from './services/audio.service';
import { PlaylistService }     from './services/playlist.service';
import { CountryService }      from './services/country.service';

/*
this module declares all services
*/

@NgModule({
  declarations: [],
  providers: [
    CookieService
  ],
  imports: [
    CommonModule
  ],
  exports: []
})
export class CoreModule {}
