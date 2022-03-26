import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {

    constructor(public translate: TranslateService) {}

    ngOnInit() {
        //console.log('home component init!!');
    }

    ngOnDestroy() {
       //console.log('home component destroy');
    }
}
