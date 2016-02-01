"use strict";

var mod = angular.module('TransportStatus', ['restService']);

mod.service(
  "transpStatus",
  function ($q, $log, myRest) {
    const UNKNOWN_VALIDATOR_NAME = 'неизвестный';
    const UNKNOWN_PP_NAME = 'неизвестный';

    function getBusDefines(dtStart, dtEnd) {
      let deferred = $q.defer();

      $q.all([
        myRest.getVehicles(),
        myRest.getTerminals(),
        myRest.getTranspStatusRawData(dtStart, dtEnd)
      ]).then(
        function (results) {
          let vehicles = results[0];
          let terminals = results[1];
          let transpRawData = results[2];
          let compactTransRawData = myRest.compactTranspStatusRawData(transpRawData);

          let busDefines = [];
          vehicles = _.sortBy(vehicles, 'terminal_id');
          vehicles.forEach(function (vehcl) {
            let busDef = {
              vehicleID: vehcl.id,
              busName: vehcl.terminal_id,
              ppCount: 0,
              pp: [],
              validatorCount: 0,
              validators: []
            };

            busDef.busType = getBusType(busDef.busName);

            // Get number of validators and pp
            let term = _.find(terminals, ['number', busDef.busName]);
            if (term) {
              busDef.validatorCount = term.validatorAmount;
              busDef.ppCount = term.detectorAmount;
            }

            // Get validator and pp names
            let busData = _.filter(compactTransRawData, ['vehicleID', busDef.vehicleID]);
            let dif;
            busData.forEach(function (d) {
              // Handle validator names
              dif = _.difference(d.validators, busDef.validators);
              if (dif.length > 0) { // something new found
                busDef.validators = _.sortBy(_.concat(busDef.validators, dif));
              }

              // Handle pp names
              dif = _.difference(d.pp, busDef.pp);
              if (dif.length > 0) { // something new found
                busDef.pp = _.sortBy(_.concat(busDef.pp, dif));
              }
            });

            busDefines.push(busDef);
          });

          // Add unknown pp and validators if needed
          busDefines.forEach(function(d) {
            let item2add = 0;
            if (d.validators.length !== d.validatorCount) {
              item2add = d.validatorCount - d.validators.length;
              for (var i = 0; i < item2add; i++) {
                d.validators.push(`${UNKNOWN_VALIDATOR_NAME} ${i + 1}`);
              }
            }
            if (d.pp.length !== d.ppCount) {
              item2add = d.ppCount - d.pp.length;
              for (var i = 0; i < item2add; i++) {
                d.pp.push(`${UNKNOWN_PP_NAME} ${i + 1}`);
              }
            }
          });

          // Create online points for bus, pps, validators
          createOnlinePoints(busDefines, compactTransRawData);

          // Create periods for timelines
          createPeriods(busDefines, dtStart, dtEnd);

          createStatuses(busDefines);

          deferred.resolve(busDefines);
        }
      );

      return deferred.promise;
    }
    //getBusDefines(moment().subtract(1, 'days'), moment()).then(
    //  function (data) {
    //    logData(data);
    //  }
    //);

    function getBusType(busName) {
      return isInt(busName) ? "trolleybus" : "bus";
    }

    function createOnlinePoints(busDefines, transpStatusData) {
      busDefines.forEach(function (bus) {
        bus.onlinePoints = [];
        // Prepare space for online points of pp
        bus.ppOnlinePoints = {};
        bus.pp.forEach(function (name) {
          bus.ppOnlinePoints[name] = [];
        });
        // Prepare space for online points of validators
        bus.validatorOnlinePoints = {};
        bus.validators.forEach(function (name) {
          bus.validatorOnlinePoints[name] = [];
        });

        let busStatusData = _.filter(transpStatusData, ['vehicleID', bus.vehicleID]);
        busStatusData.forEach(function (statusItem) {
          const dt = moment.unix(statusItem.timestamp);
          const point = new OnlinePoint(dt);

          // Add online point for bus
          bus.onlinePoints.push(point);

          // Add online point for every mentioned pp
          statusItem.pp.forEach(function (pp) {
            bus.ppOnlinePoints[pp].push(point);
          });

          // Add online point for every mentioned validator
          statusItem.validators.forEach(function (v) {
            bus.validatorOnlinePoints[v].push(point);
          });
        });
      });
    }

    function createPeriods(busDefines, dtStart, dtEnd) {
      busDefines.forEach(function (bus) {
        // Create bus periods
        bus.periods = findPeriods(dtStart, dtEnd, bus.onlinePoints, onlinePointMaxDistance);

        // Create periods for every pp
        bus.ppPeriods = {};
        bus.pp.forEach(function (name) {
          bus.ppPeriods[name] = findPeriods(dtStart, dtEnd,
            bus.ppOnlinePoints[name], onlinePointMaxDistance);
        });

        // Create periods for every validator
        bus.validatorPeriods = {};
        bus.validators.forEach(function (name) {
          bus.validatorPeriods[name] = findPeriods(dtStart, dtEnd,
            bus.validatorOnlinePoints[name], onlinePointMaxDistance);
        });
      });
    }

    function createStatuses(busDefines) {
      busDefines.forEach(function (bus) {
        // Bus status
        bus.status = getStatusByLastPeriod(bus.periods);

        // Create status for every pp
        bus.ppStatuses = {};
        bus.pp.forEach(function (name) {
          bus.ppStatuses[name] = getStatusByLastPeriod(bus.ppPeriods[name]);
        });

        // Create status for every validator
        bus.validatorStatuses = {};
        bus.validators.forEach(function (name) {
          bus.validatorStatuses[name] = getStatusByLastPeriod(bus.validatorPeriods[name]);
        });
      });
    }

    function getStatusByLastPeriod(periods) {
      if (!periods || periods.length === 0) {
        return 'UNKNOWN';
      }

      const lastPer = periods[periods.length - 1];
      if (lastPer instanceof OnlinePeriod) {
        return 'OK';
      }
      else if (lastPer instanceof OfflinePeriod) {
        return 'FAIL';
      }
      else {
        return 'UNKNOWN';
      }
    }

    function getEvents(bus, dtStart, dtEnd) {
      let deferred = $q.defer();

      const buses = [
        'Автобус 1',
        'Автобус 2'
      ];
      const eventTypes = [
        'validator_OK',
        'validator_FAIL',
        'pp_OK',
        'pp_FAIL',
        'uhf_OK',
        'uhf_FAIL'
      ];

      let events = _.times(500, function (ind) {
        let newEvent = {};
        newEvent.timestamp = moment().subtract(10 * ind, 'minutes');
        newEvent.bus = _.sample(buses);
        newEvent.name = _.sample(eventTypes);
        return newEvent;
      });
      deferred.resolve(events);

      return deferred.promise;
    }

    function log(msg) {
      $log.debug(msg);
    }

    return ({
      getEvents: getEvents,
      getBusDefines: getBusDefines
    });

  }
);
