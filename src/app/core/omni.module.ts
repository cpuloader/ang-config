import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient }    from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';

import { ScrollingModule } from '@angular/cdk/scrolling';

import { TranslateModule } from '@ngx-translate/core';

import { DateFieldPipe } from '../pipes/date-field.pipe';
import { AbsPlayerComponent } from '../components/player/absplayer.component';
import { PlayerComponent } from '../components/player/player.component';
import { PlayerPanelComponent } from '../components/player-panel.component';
import { FooterComponent } from '../components/footer.component';
import { AudioComponent } from '../components/player/audio.component';
import { VolumeComponent } from '../components/volume.component';

import { DraggableDirective } from '../directives/draggable.directive';

/*
this module declares things that used in ALL app
*/

@NgModule({
  declarations: [
    DateFieldPipe,
    AbsPlayerComponent,
    PlayerComponent,
    AudioComponent,
    FooterComponent,
    PlayerPanelComponent,
    VolumeComponent,
    DraggableDirective
  ],
  providers: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatButtonModule, MatMenuModule, MatSidenavModule, MatGridListModule, MatInputModule,
    MatDialogModule, MatTabsModule, MatCardModule, MatIconModule, MatToolbarModule,
    MatProgressBarModule, MatProgressSpinnerModule, MatSliderModule, MatCheckboxModule,
    MatChipsModule, MatSelectModule,
    ScrollingModule
  ],
  exports: [
    ReactiveFormsModule,
    MatButtonModule, MatMenuModule, MatSidenavModule, MatGridListModule, MatInputModule,
    MatDialogModule, MatTabsModule, MatCardModule, MatIconModule, MatToolbarModule,
    MatProgressBarModule, MatProgressSpinnerModule, MatSliderModule, MatCheckboxModule,
    MatChipsModule, MatSelectModule,
    ScrollingModule,
    TranslateModule,
    DateFieldPipe,
    AbsPlayerComponent,
    PlayerComponent,
    PlayerPanelComponent,
    AudioComponent,
    FooterComponent,
    VolumeComponent,
    DraggableDirective
  ]
})
export class OmniModule {}
