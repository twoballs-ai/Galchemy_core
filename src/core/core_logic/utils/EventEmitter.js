// core/utils/EventEmitter.js
export class EventEmitter {
    constructor() {
      this.listeners = {};
    }
  
    on(event, listener) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(listener);
    }
  
    off(event, listener) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    }
  
    emit(event, data) {
      (this.listeners[event] || []).forEach(listener => listener(data));
    }
  }
  