"use strict";

class OnlinePoint {
  constructor(t) {
    this.timestamp = t;
  }

  toString() {
    return this.timestamp.format('YYYY-MM-DD HH:mm:ss');
  }
}
