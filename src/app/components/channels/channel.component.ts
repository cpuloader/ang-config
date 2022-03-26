import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'channel',
    templateUrl: './channel.component.html',
    styleUrls: ['./channel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChannelComponent {
    @Input()name: string;

    cards: any = [
      { id: 1, name: 'deep' }, { id: 2, name: 'techno' }, { id: 3, name: 'electronica' }
    ];

    constructor(public translate: TranslateService) {}

    ngOnInit() {}

    ngOnDestroy() {}
}
