"use strict";

// Base event class
class TransportStatusEvent {
  constructor(t, bus, end) {
    this.timestamp = t;
    this.bus = bus;
    this.end = end;
  }

  toString() {
    return this.timestamp.format('YYYY-MM-DD HH:mm:ss');
  }

  getTypeName() {
    return toString();
  }

  getComponentName() {
    return '';
  }

  getDuration() {
    return this.end ? this.end.from(this.timestamp, true) : "";
  }
}


/////////////////////////////////////////////////////////////////////
// Bus events

class BusEvent extends TransportStatusEvent {
  getComponentName() {
    return 'БК';
  }
}

class BusConnectedEvent extends BusEvent {
  getTypeName() {
    return 'появилась связь';
  }
}

class BusDisconnnectedEvent extends BusEvent {
  getTypeName() {
    return 'пропала связь';
  }
}


/////////////////////////////////////////////////////////////////////
// Validator events

class ValidatorEvent extends TransportStatusEvent {
  constructor(t, bus, end, validator) {
    super(t, bus, end);
    this.validator = validator;
  }

  getComponentName() {
    return this.validator;
  }
}


class ValidatorFailEvent extends ValidatorEvent {
  getTypeName() {
    return 'пропал валидатор';
  }
}

class ValidatorAppearedEvent extends ValidatorEvent {
  getTypeName() {
    return 'появился валидатор';
  }
}


/////////////////////////////////////////////////////////////////////
// PP events

class PpEvent extends TransportStatusEvent {
  constructor(t, bus, end, pp) {
    super(t, bus, end);
    this.pp = pp;
  }

  getComponentName() {
    return this.pp;
  }
}

class PpFailEvent extends PpEvent {
  getTypeName() {
    return 'пропал датчик ПП';
  }
}

class PpAppearedEvent extends PpEvent {
  getTypeName() {
    return 'появился датчик ПП';
  }
}

/////////////////////////////////////////////////////////////////////
// GPS events

class GpsEvent extends TransportStatusEvent {
  getComponentName() {
    return 'GPS';
  }
}

class GpsFailEvent extends GpsEvent {
  getTypeName() {
    return 'пропал GPS';
  }
}

class GpsAppearedEvent extends GpsEvent {
  getTypeName() {
    return 'появился GPS';
  }
}
