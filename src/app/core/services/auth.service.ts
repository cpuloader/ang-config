import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { User, UserWrapped, Crop, Avatar, AvatarWrapper } from '../../objects/objects';
import { ConfigService } from './config.service';
import { StorageService } from './storage.service';
import { HeadersService } from './headers.service';
import * as _ from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string;
  private _me: User = null;

  // stream of user
  private _me$: BehaviorSubject<User> = new BehaviorSubject(null);
  get userUpdated$(): Observable<User> {
      return this._me$.asObservable();
  }
  set updateUser(user: User) {
      this._me$.next(user);
  }

  constructor(private http: HttpClient,
              private cookieService: CookieService,
              private storageService: StorageService,
              private headers: HeadersService,
              private config: ConfigService) {

    this.apiUrl = this.config.getApiUrl();
    this._me = this.getMeFromStorage();
    this._me$.next(this._me);
  }

  isAuthorized(): boolean {
    let me: User = this.getMeFromStorage();
    return me ? (me.id > 0) : false;
  }

  getMeByHttp(): Observable<User> {
    let url: string = `${this.apiUrl}/auth/settings.json`;
    return this.http.get<UserWrapped>(url).pipe(
      map(res => this._getUserSuccess(res))
    );
  }

  getMeFromStorage(): User {
    return this.storageService.get('me');
  }

  getMe(): User {
    return _.cloneDeep(this._me);
  }

  setMe(user: User): User {
    this._me = _.cloneDeep(user);
    this._saveMeToStorage(user);
    this._me$.next(user);
    return user;
  }

  private _getUserSuccess(wUser: UserWrapped) {
    let user: User = wUser.user;
    return this.setMe(user);
  }

  private _saveMeToStorage(user: User) {
    this.storageService.set('me', user);
  }

  login(email: string, password: string, rememberMe: boolean): Observable<User> {
    const url: string = `${this.apiUrl}/auth/login.json`;
    const body = {
      user: {
        email: email,
        password: password,
        remember_me: rememberMe
      }
    };
    return this.http.post<UserWrapped>(url, body, { headers: this.headers.makeCSRFHeader() }).pipe(
      map(res => this._loginSuccess(res, rememberMe),
          (error: any) => error)
    );
  }

  private _loginSuccess(wUser: UserWrapped, rememberMe: boolean) {
    let user: User = wUser.user;
    this._saveMeToStorage(user);
    this._me = user;
    this._me$.next(user);
    console.log('user saved!', user);
    return user;
  }

  signup(email: string, password: string, lang: string): Observable<User> {
    const url: string = `${this.apiUrl}/auth/settings.json`;
    const body = {
      user: {
        email: email,
        password: password,
        lang: lang
      }
    };
    return this.http.post<UserWrapped>(url, body, { headers: this.headers.makeCSRFHeader() }).pipe(
      map(res => this._signupSuccess(res),
          (error: any) => error)
    );
  }

  private _signupSuccess(wUser: UserWrapped) {
    let user: User = wUser.user;
    this._saveMeToStorage(user);
    this._me = user;
    this._me$.next(user);
    return user;
  }

  complete(email: string, password: string): Observable<User> {
    const url: string = `${this.apiUrl}/auth/complete`;
    const body = {
      user: {
        email: email,
        password: password
      }
    };
    return this.http.post<UserWrapped>(url, body, { headers: this.headers.makeCSRFHeader() }).pipe(
      map(res => this._updateSuccess(res),
          (error: any) => error)
    );
  }

  sendToken(token: string): Observable<any> {
    const url: string = `${this.apiUrl}/auth/confirm.json`;
    const body = {
      user: {
        confirmation_token: token
      }
    };
    return this.http.post(url, body, { headers: this.headers.makeCSRFHeader() })
  }

  restorePassword(email: string): Observable<any> {
    const url: string = `${this.apiUrl}/auth/password.json`;
    const body = {
      user: {
        email: email
      }
    };
    return this.http.post(url, body, { headers: this.headers.makeCSRFHeader() })
  }

  resetPassword(password: string, token: string): Observable<any> {
    const url: string = `${this.apiUrl}/auth/password.json`;
    const body = {
      user: {
        reset_password_token: token,
        password: password
      }
    };
    return this.http.put(url, body, { headers: this.headers.makeCSRFHeader() })
  }

  logout(): Observable<any> {
    const url: string = `${this.apiUrl}/auth/logout.json`;
    return this.http.delete(url, { headers: this.headers.makeCSRFHeader() })
      .pipe(
          map(res => this.afterLogout(res) )
      ).pipe(
          catchError(err => this.afterLogout(err) ) // clean all in any case
      );
  }

  afterLogout(res: any): any {
    this.storageService.clear();
    this._me = null;
    this._me$.next(null);
    return res;
  }

  updateMe(user: User): Observable<User> {
    const url: string = `${this.apiUrl}/auth/settings.json`;
    const body = {
      user: user
    };
    return this.http.put<UserWrapped>(url, body, { headers: this.headers.makeCSRFHeader() }).pipe(
      map(res => this._updateSuccess(res),
          (error: any) => error)
    );
  }

  private _updateSuccess(wUser: UserWrapped) {
    let user: User = wUser.user;
    this._saveMeToStorage(user);
    this._me = user;
    this._me$.next(user);
    return user;
  }

  updateAvatar(userId: number, file: any): Observable<AvatarWrapper> {
    const url = `${this.apiUrl}/users/${userId}/avatar`;
    let formData: FormData = new FormData();
    formData.append("file", file, file.name);
    return this.http.post<AvatarWrapper>(url, formData, { headers: this.headers.makeCSRFHeader() });//, reportProgress: true });
  }

  cropAvatar(userId: number, cropData: Crop): Observable<any> {
    const url = `${this.apiUrl}/users/${userId}/avatar`;
    const body = {
      crop: cropData
    };
    return this.http.put(url, body, { headers: this.headers.makeCSRFHeader() });
  }
}
