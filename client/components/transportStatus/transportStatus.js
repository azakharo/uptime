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
          vehicles.forEach(function (vehcl) {
            let busDef = {
              vehicleID: vehcl.id,
              busName: vehcl.terminal_id,
              ppCount: 0,
              pp: [],
              validatorCount: 0,
              validators: []
            };

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
                d.validators.push(UNKNOWN_VALIDATOR_NAME);
              }
            }
            if (d.pp.length !== d.ppCount) {
              item2add = d.ppCount - d.pp.length;
              for (var i = 0; i < item2add; i++) {
                d.pp.push(UNKNOWN_PP_NAME);
              }
            }
          });

          // Create online points for bus, pps, validators
          createOnlinePoints(busDefines, compactTransRawData);

          deferred.resolve(busDefines);
        }
      );

      return deferred.promise;
    }
    getBusDefines(moment().subtract(1, 'days'), moment()).then(
      function (data) {
        logData(data);
      }
    );

    function createOnlinePoints(busDefines, transpStatusData) {
      busDefines.forEach(function (bus) {
        bus.onlinePoints = [];
        // Prepare space for online points of pp
        bus.ppOnlinePoints = new Map();
        bus.pp.forEach(function (name) {
          bus.ppOnlinePoints.set(name, []);
        });
        // Prepare space for online points of validators
        bus.validatorOnlinePoints = new Map();
        bus.validators.forEach(function (name) {
          bus.validatorOnlinePoints.set(name, []);
        });

        let busStatusData = _.filter(transpStatusData, ['vehicleID', bus.vehicleID]);
        busStatusData.forEach(function (statusItem) {
          const dt = moment.unix(statusItem.timestamp);
          const point = new OnlinePoint(dt);

          // Add online point for bus
          bus.onlinePoints.push(point);

          // Add online point for every mentioned pp
          statusItem.pp.forEach(function (pp) {
            bus.ppOnlinePoints.get(pp).push(point);
          });

          // Add online point for every mentioned validator
          statusItem.validators.forEach(function (v) {
            bus.validatorOnlinePoints.get(v).push(point);
          });

          //for (const k of bus.ppOnlinePoints.keys()) {
          //  log(`${k} - ${bus.ppOnlinePoints.get(k)}`);
          //}
        });
      });
    }

    function getTransportStatus(dtStart, dtEnd) {
      let deferred = $q.defer();

      let data = [
        {
          type: 'trolleybus',
          name: '1022',
          status: 'OK',
          events: [
            {
              timestamp: moment(),
              status: 'PARTIAL'
            }
          ],
          validators: [
            {
              name: 'v1',
              status: 'OK',
              events: [
                {
                  timestamp: moment(),
                  status: 'FAIL'
                }
              ]
            },
            {
              name: 'v2',
              status: 'OK',
              events: []
            },
            {
              name: 'v3',
              status: 'OK',
              events: []
            }
          ],
          pps: [
            {
              name: 'pp1',
              status: 'OK',
              events: []
            },
            {
              name: 'pp2',
              status: 'OK',
              events: []
            },
            {
              name: 'pp3',
              status: 'OK',
              events: []
            }
          ],
          uhf: {
            status: 'OK',
            events: []
          }
        },
        {
          type: 'bus',
          name: '1093',
          status: 'FAIL',
          events: [
            {
              timestamp: moment(),
              status: 'FAIL'
            }
          ],
          validators: [
            {
              name: 'v1',
              status: 'FAIL',
              events: [
                {
                  timestamp: moment(),
                  status: 'FAIL'
                }
              ]
            },
            {
              name: 'v2',
              status: 'FAIL',
              events: []
            }
          ],
          pps: [
            {
              name: 'pp1',
              status: 'FAIL',
              events: []
            },
            {
              name: 'pp2',
              status: 'FAIL',
              events: []
            }
          ],
          uhf: {
            status: 'FAIL',
            events: []
          }
        }
      ];

      deferred.resolve(data);

      return deferred.promise;
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
      getTransportStatus: getTransportStatus,
      getEvents: getEvents
    });

  }
);
