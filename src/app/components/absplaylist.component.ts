import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'abs-playlist',
  template: '<div></div>'
})
export class AbsPlaylistComponent implements OnInit, OnDestroy {

    constructor() {}

    ngOnInit() {
        //console.log('abs playlist component init');
    }

    ngOnDestroy() {
       //console.log('abs playlist component destroy');
    }
}
