import { Injectable } from '@angular/core';
import { CacheFactory } from 'cachefactory';


@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private static cacheFactory: CacheFactory = new CacheFactory();

  constructor() {}

  create(name: string, time: number): any {
    let cache;

    if (!CacheService.cacheFactory.exists(name)) {
      cache = CacheService.cacheFactory.createCache(name, {
        deleteOnExpire: 'passive',//'aggressive',
        //recycleFreq: 60 * 1000, // 60 sec
        maxAge: time
      });
    }
    return cache;
  }

}
