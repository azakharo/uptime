"use strict";

var mod = angular.module('TransportStatus', ['restService']);

mod.service(
  "transpStatus",
  function ($q, $log, myRest) {

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

            busDefines.push(busDef);
          });

          deferred.resolve(busDefines);
        }
      );

      return deferred.promise;
    }
    getBusDefines(moment().subtract(1, 'days'), moment()).then(
      function (data) {
        log(JSON.stringify(data, null, 2));
      }
    );

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
