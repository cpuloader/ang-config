import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash-es';

import { AuthService } from '../../core/services/auth.service';
import { User, Avatar, AvatarWrapper } from '../../objects/objects';
import { AvatarCropDialogComponent } from './avatar-crop-dialog.component';

@Component({
    selector: 'avatar-upload',
    templateUrl: './avatar-upload.component.html',
    styleUrls: ['./avatar-upload.component.scss']
})
export class AvatarUploadComponent implements OnInit, OnDestroy {
  @Input()blocked: boolean; // if user settings updating in progress
  @Output()avatarChanged: EventEmitter<Avatar> = new EventEmitter<Avatar>();
  user: User;
  error: any;
  uploading: boolean;
  dialog: MatDialogRef<any>;
  private _avatar: Avatar;
  private _avatarUpdater: Subscription;

  constructor(public translate: TranslateService,
              private authService: AuthService,
              private vcr: ViewContainerRef,
              private mdDialog: MatDialog) {
  }

  getImage(): string {
    return this.user.avatar ? `url(${this.user.avatar.original})` :
                          `url('/images/avatar/pseudo/xlarge.png')`;
  }

  updateAvatar(event: any): void {
    if (this.uploading) return;

    this.error = undefined;
    let file: File = event.target.files[0];
    if (!file) {
      return;
    }
    let ext = file.name.toLowerCase();
    if (ext.lastIndexOf('jpg') === -1 && ext.lastIndexOf('jpeg') === -1 &&
        ext.lastIndexOf('gif') === -1 && ext.lastIndexOf('png') === -1) {
      console.log('Wrong file type! JPG, GIF, PNG only.');
      return;
    }
    if (file['size'] && file.size > 1024*1024*5) {
      this.error = { error: 'File is too big, should be < 5 MB'};
      console.log(file, 'File is too big, should be < 5 MB');
      return;
    }

    this.uploading = true;

    if (this._avatarUpdater) this._avatarUpdater.unsubscribe();

    this._avatarUpdater = this.authService.updateAvatar(this.user.id, file).subscribe(
        res => {
          this.uploading = false;
          this._avatar = res.avatar;
          this.openCropDialog();
        },
        err => {
          this.uploading = false;
          console.log('error!', event);
        });
  }

  openCropDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.viewContainerRef = this.vcr;
    this.dialog = this.mdDialog.open(AvatarCropDialogComponent, dialogConfig);
    this.dialog.componentInstance.user = _.cloneDeep(this.user);
    this.dialog.componentInstance.avatar = this._avatar;
    this.dialog.afterClosed().subscribe(result => {
      this.dialog = null;
      if (result) {
        this.user = this.authService.getMe();
        console.log('user & new avatar', this.user);
      }
    });
  }

  ngOnInit() {
    this.user = this.authService.getMe();
  }

  ngOnDestroy() {
    if (this._avatarUpdater) this._avatarUpdater.unsubscribe();
  }
}
