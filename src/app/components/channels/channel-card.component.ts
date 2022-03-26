import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router }   from '@angular/router';

import { AbsPlaylistComponent } from '../absplaylist.component';

@Component({
    selector: 'channel-card',
    templateUrl: './channel-card.component.html',
    styleUrls: ['./channel-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChannelCardComponent extends AbsPlaylistComponent implements OnInit, OnDestroy {
    @Input()id: string;

    constructor(public translate: TranslateService,
                private mainrouter: Router) {
      super();
    }

    goToChannel() {
      if (this.id) {
        this.mainrouter.navigate(['/channel/' + this.id ]);
      } else {
        this.mainrouter.navigate(['/page404']);
      }
    }

    ngOnInit() {
      super.ngOnInit();
    }

    ngOnDestroy() {
      super.ngOnDestroy();
    }
}
