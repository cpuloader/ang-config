import { NgModule }      from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule }   from '../shared/shared.module';
import { QueuePage } from '../pages/queue.page';

const routes: Routes = [
  { path: '', component: QueuePage }
];

@NgModule({
  declarations: [
    QueuePage
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  exports: []
})
export class QueueModule {}
