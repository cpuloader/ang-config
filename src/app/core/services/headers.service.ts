import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { WindowRef } from './window.service';

@Injectable({
  providedIn: 'root'
})
export class HeadersService {

  constructor(private window: WindowRef,
              private cookieService: CookieService) {}

  makeCSRFHeader(): HttpHeaders {
    const csrf = this.cookieService.get('XSRF-TOKEN');
    return new HttpHeaders({"X-XSRF-TOKEN": csrf});
  }

  makeCSRFandContentHeader(): HttpHeaders {
    const csrf = this.cookieService.get('XSRF-TOKEN');
    return new HttpHeaders({"X-XSRF-TOKEN": csrf, "Content-Type": "application/json"});
  }

  makeXMLHttpheaders(): HttpHeaders {
    const csrf = this.cookieService.get('XSRF-TOKEN');
    return new HttpHeaders({"X-XSRF-TOKEN": csrf,
                            "Accept": "application/json",
                            "Cache-Control": "no-cache",
                            "X-Requested-With": "XMLHttpRequest"});
  }

  getCSRF(): string {
    return this.cookieService.get('XSRF-TOKEN');
  }
}
