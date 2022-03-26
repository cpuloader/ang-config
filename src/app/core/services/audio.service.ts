import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MixFilePath } from '../../objects/objects';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  audio: any;

  constructor(@Inject(DOCUMENT) public document: any) {
      if (document) {
          this.audio = document.createElement('audio');
      }
  }

  /**
  * Возвращает главный аудио-элемент.
  */
  getElement(): any {
      return this.audio;
  }

  /**
  * Возвращает новый аудио-элемент.
  */
  createElement(): any {
      return this.document.createElement('audio');
  }

  /**
  * Возвращает подходящий тип аудио-файла, который может проиграть браузер.
  */
  findSource(element: any, sources: MixFilePath[]): MixFilePath {
      if (!sources || !element) return null;
      let result: MixFilePath;

      for (let source of sources) {
        if (element.canPlayType(source.type)) {
          result = source;
          break;
        }
      }
      return result;
  }

  /**
  * Загружает метаданные аудио-файла.
  */
  loadMetadata(element: any, sources: MixFilePath[]) {
      let file = this.findSource(element, sources);

      element.setAttribute('preload', 'metadata');
      element.setAttribute('src', file.src);
      element.setAttribute('type', file.type);
  }

  findSourceForSub(element: any, sources: MixFilePath[], channelConfig: any): MixFilePath {
      //console.log('have sub?', channelConfig, Me.checkChannelsSubscription(channelConfig));
      // если источник только один, выводим его
      let result: MixFilePath;
      if (sources.length == 1) {
        //console.log('source is only one');
        return sources[0];
      }

      /*if (Me.checkChannelsSubscription(channelConfig)) {
          for (var i = 0; i < sources.length; i++) {
              // для оплаченного канала берем 320
              if (sources[i].quality == '320') {
                  return sources[i];
              }
          }
      }*/
      // иначе ищем любой другой c качеством 128
      for (let source of sources) {
        if (source.quality === 128) {
            result = source;
            break;
        }
      }
  }

    loadMetadataForSub(element: any, sources: MixFilePath[], channelConfig: any) {
        let file = this.findSourceForSub(element, sources, channelConfig);
        if (!file) return;

        element.setAttribute('preload', 'metadata');
        element.setAttribute('src', file.src);
        element.setAttribute('type', file.type);
    }

    /*changeBitrateWithSub(sources: MixFilePath[], channelConfig: any, currentType: string, quality: number) {
        var btr;
        //console.log('have sub?', channelConfig, Me.checkChannelsSubscription(channelConfig));
        // если источник только один, выводим его
        if (sources.length == 1) {
          //console.log('source is only one');
          return sources[0];
        }

        if (Me.checkChannelsSubscription(channelConfig)) {
            btr = quality ? quality : 320; // для оплаченного канала берем 320 по умолчанию
            for (var i = 0; i < sources.length; i++) {
                if (sources[i].quality == btr) {
                    return sources[i];
                }
            }
        }
        // иначе ищем любой другой c качеством 128
        return _.find(sources, function(source) {
            return source.quality == '128';
        });
    }*/

}
