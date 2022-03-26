import { Injectable } from '@angular/core';
import { HttpResponse, HttpErrorResponse, HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { UsersService } from '../core/services/users.service';
import { Observable, pipe } from 'rxjs';
import { tap, first } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router, private authService: AuthService, private usersService: UsersService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        //if (event instanceof HttpResponse) {}
      }, (err: any) => {
        if (err instanceof HttpErrorResponse) {
          const snapshot = this.router.routerState.snapshot;
          if (err.status === 401 && !snapshot.url.startsWith('/auth/')) {
            //console.log('snapshot', this.router.routerState.snapshot);
            this.authService.logout().pipe(first()).subscribe(() => {});
            console.log('AuthInterceptor: unauthorized');
          }
        }
      })
    );
  }
}
