import { Directive, OnInit, OnDestroy, Input, Output, ElementRef, Renderer2,
         EventEmitter } from '@angular/core';
import { WindowRef } from '../core/services/window.service';
import { UtilsService } from '../core/services/utils.service';
import { ClientRect } from '../objects/objects';

@Directive({
    selector: '[draggable]'
})
export class DraggableDirective implements OnInit, OnDestroy {

  @Input('draggable')name: string;
  @Input('draggableTarget')target: boolean;
  @Input('draggableHandle')handleInput: string;
  @Output()dragEvents = new EventEmitter<ClientRect>();

  startX: number = 0;
  startY: number = 0;
  offset: any = null;
  handle: any = null;

  bindedMouseDown: any;
  bindedTouchStart: any;
  bindedPointDown: any;
  bindedPointMove: any;
  bindedPointUp: any;
  bindedTouchMove: any;

  constructor(private el: ElementRef, private renderer: Renderer2,
              private window: WindowRef, private utils: UtilsService) {

  }

  ngOnInit() {
    this.bindedMouseDown = this.onMouseDown.bind(this);
    this.bindedTouchStart = this.onTouchStart.bind(this);
    this.bindedPointDown = this.pointdown.bind(this);
    this.bindedPointMove = this.pointmove.bind(this);
    this.bindedTouchMove = this.touchmove.bind(this);
    this.bindedPointUp = this.pointup.bind(this);

    if (this.target) {
      if (this.handleInput) {
        let h = this.el.nativeElement.getElementById(this.handleInput);
        this.handle = h || this.el.nativeElement;
      }
      this.handle = this.el.nativeElement;
    }
    this.bindEvents();
  }

  ngOnDestroy() {
    this.unbindEvents();
    this.offset = null;
    this.handle = null;
  }

  bindEvents() {
    this.handle.addEventListener('mousedown', this.bindedMouseDown);
    this.handle.addEventListener('touchstart', this.bindedTouchStart);
  }

  unbindEvents() {
    this.handle.removeEventListener('mousedown', this.bindedMouseDown);
    this.handle.removeEventListener('touchstart', this.bindedTouchStart);
  }

  onMouseDown(e: any) {
    this.pointdown(e, null);
    this.window.nativeWindow.document.addEventListener('mousemove', this.bindedPointMove);
    this.window.nativeWindow.document.addEventListener('mouseup', this.bindedPointUp);
  }

  onTouchStart(e: any) {
    this.pointdown(e, e.touches[0]);
    // таймаут нужен для того, чтобы после первого же нажатия не сработало событие движения
    setTimeout(function() {
        this.window.nativeWindow.document.addEventListener('touchmove', this.bindedTouchMove);
        this.window.nativeWindow.document.addEventListener('touchend', this.bindedPointUp);
    });
  }

  pointdown(e: any, point: any) {
    let x, y, w, h;
    let pageX, pageY;

    this.offset = this.utils.getElementOffset(this.el.nativeElement, null);

    w = this.offset.width,
    h = this.offset.height;

    e.preventDefault();
    e.stopPropagation();

    point = point || e;

    this.renderer.addClass(this.el.nativeElement, 'dragging');

    pageX = point.pageX;
    pageY = point.pageY;

    if (this.target) {
      x = pageX - this.offset.x;
      y = pageY - this.offset.y;
    } else {
      x = this.offset.x;
      y = this.offset.y;
    }

    this.startX = pageX - x;
    this.startY = pageY - y;

    this.dragEvents.emit(<ClientRect>({
      name: `dragStart.${this.name}`,
      x: x,
      y: y,
      w: w,
      h: h,
      top: y,
      left: x,
      width: w,
      height: h,
      layerY: point.layerY || 0,
      layerX: point.layerX || 0,
      element: this.el.nativeElement
    }));
  }

  touchmove(e: any) {
    this.pointmove(e, e.touches[0]);
  }

  pointmove(e: any, point: any) {
    let x = 0,
        y = 0;

    point = point || e;

    x = point.pageX - this.startX;
    y = point.pageY - this.startY;

    e.preventDefault();
    e.stopPropagation();

    this.dragEvents.emit(<ClientRect>({
      name: `dragMove.${this.name}`,
      x: x,
      y: y,
      top: y,
      left: x,
      layerY: point.layerY || 0,
      layerX: point.layerX || 0
    }));
  }

  pointup() {
    this.renderer.removeClass(this.el.nativeElement, 'dragging');

    this.window.nativeWindow.document.removeEventListener('mousemove', this.bindedPointMove);
    this.window.nativeWindow.document.removeEventListener('mouseup', this.bindedPointUp);

    this.window.nativeWindow.document.removeEventListener('touchmove', this.bindedTouchMove);
    this.window.nativeWindow.document.removeEventListener('touchend', this.bindedPointUp);

    this.dragEvents.emit(<ClientRect>({
      name: `dragEnd.${this.name}`
    }));
  }


}
