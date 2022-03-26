import { NgModule }      from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule }   from '../shared/shared.module';
import { MainPage } from '../pages/main.page';
import { HomeComponent } from '../components/home.component';

const routes: Routes = [
  { path: '', component: MainPage }
];

@NgModule({
  declarations: [
    MainPage,
    HomeComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  exports: []
})
export class MainModule {}
