import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/services/auth-guard';

const routes: Routes = [
  { path: '', loadChildren: () => import('./modules/main.module').then(m => m.MainModule) },
  { path: 'auth', loadChildren: () => import('./modules/auth.module').then(m => m.AuthModule) },
  { path: 'channel', loadChildren: () => import('./modules/channel.module').then(m => m.ChannelModule) },
  { path: 'page404', loadChildren: () => import('./modules/page404.module').then(m => m.Page404Module) },
  { path: 'queue', loadChildren: () => import('./modules/queue.module').then(m => m.QueueModule) },
  { path: 'settings', loadChildren: () => import('./modules/settings.module').then(m => m.SettingsModule), canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/page404'}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule {}
