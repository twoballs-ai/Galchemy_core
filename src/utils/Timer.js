export class Timer {
    static every(ms, callback) {
      return setInterval(callback, ms);
    }
  
    static after(ms, callback) {
      return setTimeout(callback, ms);
    }
  }
  