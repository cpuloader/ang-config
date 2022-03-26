import { NgModule }      from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule }   from '@angular/forms';

import { OmniModule } from '../core/omni.module';

import { LinkParserDirective } from '../directives/links.directive';
import { ChannelComponent } from '../components/channels/channel.component';
import { ChannelsListComponent } from '../components/channels/channels-list.component';
import { AbsPlaylistComponent } from '../components/absplaylist.component';
import { ChannelCardComponent } from '../components/channels/channel-card.component';
import { MixBarComponent } from '../components/mix/mix-bar.component';
import { MixBarPlayerComponent } from '../components/player/mix-bar-player.component';

/*
this module declares things that used in lazy loaded modules only
*/

@NgModule({
  declarations: [
    ChannelComponent,
    ChannelsListComponent,
    AbsPlaylistComponent,
    ChannelCardComponent,
    MixBarComponent,
    MixBarPlayerComponent,
    LinkParserDirective
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    OmniModule
  ],
  exports: [
    FormsModule,
    OmniModule,
    ChannelComponent,
    ChannelsListComponent,
    AbsPlaylistComponent,
    ChannelCardComponent,
    MixBarComponent,
    MixBarPlayerComponent,
    LinkParserDirective
  ]
})
export class SharedModule {}
