import { Component, OnInit, OnDestroy, Input, Output } from '@angular/core';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash-es';

import { AuthService } from '../../core/services/auth.service';
import { User, Avatar, Crop } from '../../objects/objects';

@Component({
    selector: 'avatar-crop-dialog',
    templateUrl: './avatar-crop-dialog.component.html',
    styleUrls: ['./avatar-crop-dialog.component.scss']
})
export class AvatarCropDialogComponent implements OnInit, OnDestroy {
  user: User;
  avatar: Avatar;
  error: any;
  uploading: boolean;
  cropParams: Crop;
  private _avatarUpdater: Subscription;
  private _bindedImageListener: any;
  private _image: any;

  constructor(public translate: TranslateService,
              private mdDialogRef: MatDialogRef<AvatarCropDialogComponent>,
              private authService: AuthService) {
    mdDialogRef.disableClose = true; // do not close by click outside
  }

  getImage(): string {
    return this.avatar ? `url(${this.avatar.original})` :
                          `url('/images/avatar/pseudo/xlarge.png')`;
  }

  private _onImageLoad() {
    this.cropParams = <Crop>{
      x: 0,
      y: 0,
      w: this._image.width,
      h: this._image.height,
      id: this.avatar.id
    };
    console.log('new crop:', this.cropParams);
  }

  private _loadImage() {
    this._image = new Image();
    this._image.src = this.avatar.original;
    this._bindedImageListener = this._onImageLoad.bind(this);
    this._image.addEventListener('load', this._bindedImageListener);
  }

  cancel() {
    setTimeout(() => this.mdDialogRef.close(null), 50);
  }

  submit() {
    if (this.uploading) return;
    this.uploading = true;

    if (this._avatarUpdater) this._avatarUpdater.unsubscribe();

    this._avatarUpdater = this.authService.cropAvatar(this.user.id, this.cropParams).subscribe(
        res => {
          this.uploading = false;
          this.avatar.crop = this.cropParams;
          this.user.avatar = this.avatar;
          this.authService.setMe(this.user);
          setTimeout(() => this.mdDialogRef.close(this.avatar), 50);
        },
        err => {
          this.uploading = false;
          console.log('image crop error!', event);
          setTimeout(() => {
            this.error = 'Error!';
            this.mdDialogRef.close(null);
          }, 5000);
        });
  }

  ngOnInit() {
    this._loadImage();
  }

  ngOnDestroy() {
    if (this._image) {
      this._image.removeEventListener('load', this._bindedImageListener);
    }
    if (this._avatarUpdater) this._avatarUpdater.unsubscribe();
  }
}
