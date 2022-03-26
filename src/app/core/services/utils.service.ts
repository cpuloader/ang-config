import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { WindowRef } from './window.service';
import { ClientRect } from '../../objects/objects';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(@Inject(DOCUMENT) public document: any,
              private window: WindowRef) {}

  isElement(element) {
    return (element && element.nodeType && element.nodeType === element.ELEMENT_NODE);
  }

  getBoundingClientRect(element) {
    return element.getBoundingClientRect();
  }

  getWindowScroll() {
    let sx, sy;
    let d = this.window.nativeWindow;
    let e = d.documentElement;
    let b = d.body;

    if ('pageYOffset' in this.window.nativeWindow) {
      sx = this.window.nativeWindow.pageXOffset;
      sy = this.window.nativeWindow.pageYOffset;
    } else {
      sx = e.scrollLeft || b.scrollLeft || 0;
      sy = e.scrollTop || b.scrollTop || 0;
    }

    return {
      top: sy,
      left: sx
    }
  }

  getElementStyle(computed, property) {
    return computed.getPropertyValue(property);
  }

  getComputedStyles(element) {
    return this.window.nativeWindow.getComputedStyle(element, null);
  }

  getElementScroll(element) {
    return {
      top: element.scrollTop,
      left: element.scrollLeft
    }
  }

  getElementOffset(element, parent) {
    let elementComputed,
    elementRectangle,
    parentRectangle = {
        top: 0,
        left: 0
    };

    let windowScroll,
        parentScroll = {
            top: 0,
            left: 0
        };

    let top = 0,
        left = 0,
        width = 0,
        height = 0;

    let marginTop = 0,
        marginLeft = 0;

    if (!this.isElement(element)) {
        width = this.window.nativeWindow.innerWidth;
        height = this.window.nativeWindow.innerHeight;

        return <ClientRect>({
            w: width,
            h: height,
            width: width,
            height: height,
            x: left,
            y: top,
            top: top,
            left: left,
            marginTop: marginTop,
            marginLeft: marginLeft
        });
    }

    elementComputed = this.getComputedStyles(element);
    elementRectangle = element.getBoundingClientRect();

    windowScroll = this.getWindowScroll();

    // если `parent` не является DOM-элементом, а является объектом `window`, то обнуляем `parent`
    if (parent) {
      parent = this.isElement(parent) ? parent : null;
    }
    parentRectangle = parent ? this.getBoundingClientRect(parent) : parentRectangle;
    parentScroll = parent ? this.getElementScroll(parent) : parentScroll;

    top = parent ? elementRectangle.top - parentRectangle.top + parentScroll.top : elementRectangle.top + windowScroll.top;
    left = parent ? elementRectangle.left - parentRectangle.left + parentScroll.left : elementRectangle.left + windowScroll.left;

    width = elementRectangle.width;
    height = elementRectangle.height;

    marginTop = parseFloat(this.getElementStyle(elementComputed, 'margin-top'));
    marginLeft = parseFloat(this.getElementStyle(elementComputed, 'margin-left'));

    return <ClientRect>({
        w: width,
        h: height,
        width: width,
        height: height,
        x: left,
        y: top,
        top: top,
        left: left,
        marginTop: marginTop,
        marginLeft: marginLeft
    });

  }
}
