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

  getTypeName() {
    return toString();
  }

  getComponentName() {
    return '';
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
  constructor(t, bus, validator) {
    super(t, bus);
    this.validator = validator;
  }

  getComponentName() {
    return 'валидатор';
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
  constructor(t, bus, pp) {
    super(t, bus);
    this.pp = pp;
  }

  getComponentName() {
    return 'датчик ПП';
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
