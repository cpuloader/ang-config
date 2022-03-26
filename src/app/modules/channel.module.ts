import { NgModule }      from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule }   from '../shared/shared.module';
import { ChannelPage } from '../pages/channel.page';

const routes: Routes = [
  { path: ':channelId', component: ChannelPage }
];

@NgModule({
  declarations: [
    ChannelPage
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  exports: []
})
export class ChannelModule {}
