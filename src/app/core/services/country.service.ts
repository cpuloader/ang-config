import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
//import { map } from 'rxjs/operators';
import { Country, City } from '../../objects/objects';
import { ConfigService } from './config.service';
//import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private apiUrl: string;

  constructor(private http: HttpClient,
              //private storageService: StorageService,
              private config: ConfigService) {

    this.apiUrl = this.config.getApiUrl();
  }

  getCountries(lang: string): Observable<Country[]> {
    let url: string = `${this.apiUrl}/get/countries/${lang}`;
    return this.http.get<Country[]>(url);
  }

  getCities(countryId: number): Observable<City[]> {
    let url: string = `${this.apiUrl}/get/cities/${countryId}`;
    return this.http.get<City[]>(url);
  }
}
