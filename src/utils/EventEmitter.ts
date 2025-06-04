// src/utils/EventEmitter.js
export class EventEmitter {
    constructor() {
      this._events = new Map();
    }
  
    on(event, listener) {
      if (!this._events.has(event)) this._events.set(event, []);
      this._events.get(event).push(listener);
    }
  
    off(event, listener) {
      const lst = this._events.get(event);
      if (!lst) return;
      const idx = lst.indexOf(listener);
      if (idx >= 0) lst.splice(idx, 1);
    }
  
    emit(event, payload) {
      const lst = this._events.get(event);
      if (!lst) return;
      for (const fn of lst) {
        try { fn(payload); }
        catch (e) { console.error(`Error in listener for "${event}":`, e); }
      }
    }
  }
  