"use strict";

var mod = angular.module('TransportStatus', []);

mod.service(
  "transpStatus",
  function ($q, $log) {

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
          type: 'trolleybus',
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

    function log(msg) {
      $log.debug(msg);
    }

    return ({
      getTransportStatus: getTransportStatus
    });

  }
);
