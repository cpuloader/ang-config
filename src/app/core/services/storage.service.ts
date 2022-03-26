import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  supported: boolean = false;
  storage: any;

  constructor() {
    try {
      this.supported = !!localStorage;
    } catch (error) {
      this.supported = false;
    }

    if (this.supported) {
      try {
          localStorage.setItem('test', '1');
      } catch (error) {
          this.supported = false;
      }
    }
    if (this.supported) this.storage = localStorage;
  }

  set(name: string, data: any) {
    if (!this.supported) return;
    this.storage.setItem(name, JSON.stringify(data));
  }

  get(name: string): any {
    let data;
    if (!this.supported) return;
    data = this.storage.getItem(name);

    if (!data) return;
    if (typeof data === 'undefined') data = null;
    if (data === 'undefined') data = null;

    return JSON.parse(data);
  }

  remove(name: string) {
    if (!this.supported) return;
    this.storage.removeItem(name);
  }

  clear() {
    if (!this.supported) return;
    this.storage.clear();
  }
}
