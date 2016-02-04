"use strict";

// Base event class
class TransportStatusEvent {
  constructor(t, bus) {
    this.timestamp = t;
    this.bus = bus;
  }

  toString() {
    return this.timestamp.format('YYYY-MM-DD HH:mm:ss');
  }

  getDisplayString() {
    return toString();
  }
}


/////////////////////////////////////////////////////////////////////
// Bus events

class BusOnlineEvent extends TransportStatusEvent {
  getDisplayString() {
    return `${this.bus.busName} вышел на связь`;
  }
}

class BusOfflineEvent extends TransportStatusEvent {
  getDisplayString() {
    return `Пропала связь с ${this.bus.busName}`;
  }
}


/////////////////////////////////////////////////////////////////////
// Validator events

class ValidatorFailEvent extends TransportStatusEvent {
  constructor(t, bus, validator) {
    super(t, bus);
    this.validator = validator;
  }

  getDisplayString() {
    return `${this.bus.busName}: пропал валидатор ${this.validator}`;
  }
}

class ValidatorAppearedEvent extends TransportStatusEvent {
  constructor(t, bus, validator) {
    super(t, bus);
    this.validator = validator;
  }

  getDisplayString() {
    return `${this.bus.busName}: появился валидатор ${this.validator}`;
  }
}


/////////////////////////////////////////////////////////////////////
// PP events

class PpFailEvent extends TransportStatusEvent {
  constructor(t, bus, pp) {
    super(t, bus);
    this.pp = pp;
  }

  getDisplayString() {
    return `${this.bus.busName}: пропал датчик ПП ${this.pp}`;
  }
}

class PpAppearedEvent extends TransportStatusEvent {
  constructor(t, bus, pp) {
    super(t, bus);
    this.pp = pp;
  }

  getDisplayString() {
    return `${this.bus.busName}: появился датчик ПП ${this.pp}`;
  }
}

/////////////////////////////////////////////////////////////////////
// GPS events

class GpsFailEvent extends TransportStatusEvent {
  getDisplayString() {
    return `${this.bus.busName}: пропал GPS`;
  }
}

class GpsAppearedEvent extends TransportStatusEvent {
  getDisplayString() {
    return `${this.bus.busName}: появился GPS`;
  }
}
