import { NgModule }      from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule }   from '../shared/shared.module';
import { Page404Page } from '../pages/404.page';


const routes: Routes = [
  { path: '', component: Page404Page }
];

@NgModule({
  declarations: [
    Page404Page
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  exports: []
})
export class Page404Module {}
