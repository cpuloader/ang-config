import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { User, Avatar } from '../../objects/objects';
import { ConfigService } from './config.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl: string;

  constructor(private http: HttpClient,
              private cookieService: CookieService,
              private storageService: StorageService,
              private config: ConfigService) {

    this.apiUrl = this.config.getApiUrl();
  }

  private handleError(error: any): Observable<any> {
    let err = error || 'Error!';
    console.log(err.message || err);
    return throwError(err);
  }

  getUsers(page: number, per_page: number): Observable<any> {
    let url: string = `${this.apiUrl}/users/djs/list?page=${page}&per_page=${per_page}`;
    let headers = new HttpHeaders({"Cache-Control": "no-cache"});
    return this.http.get(url, { headers: headers });
  }
}
