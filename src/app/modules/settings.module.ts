import { NgModule }      from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule }   from '../shared/shared.module';
import { SettingsPage } from '../pages/settings.page';
import { AvatarUploadComponent } from '../components/settings/avatar-upload.component';
import { AvatarCropDialogComponent } from '../components/settings/avatar-crop-dialog.component';
import { SettingsConfirmDialogComponent } from '../components/settings/settings-confirm-dialog.component';

const routes: Routes = [
  { path: '', component: SettingsPage }
];

@NgModule({
  declarations: [
    SettingsPage,
    AvatarUploadComponent,
    AvatarCropDialogComponent,
    SettingsConfirmDialogComponent
  ],
  /*entryComponents: [ // deprecated for Ivy compiler
    AvatarCropDialogComponent, ...
  ],*/
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  exports: []
})
export class SettingsModule {}
