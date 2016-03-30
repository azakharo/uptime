"use strict";

var mod = angular.module('TransportStatus', ['restService']);

mod.service(
  "transpStatus",
  function ($q, $log, myRest) {
    const UNKNOWN_VALIDATOR_NAME = 'валидатор';
    const UNKNOWN_PP_NAME = 'датчик ПП';

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

          // Create points for bus, pps, validators
          createPoints(busDefines, compactTransRawData);

          // Create periods for timelines
          createPeriods(busDefines, dtStart, dtEnd);

          createGpsStatePoints(busDefines, compactTransRawData);
          createGpsStatePeriods(busDefines, dtStart, dtEnd);

          createBusPartialPeriods(busDefines);

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

    function createPoints(busDefines, transpStatusData) {
      busDefines.forEach(function (bus) {
        bus.onlinePoints = [];
        // Prepare space for points of pp
        bus.ppPoints = {};
        bus.pp.forEach(function (name) {
          bus.ppPoints[name] = [];
        });
        // Prepare space for points of validators
        bus.validatorPoints = {};
        bus.validators.forEach(function (name) {
          bus.validatorPoints[name] = [];
        });

        let busStatusData = _.filter(transpStatusData, ['vehicleID', bus.vehicleID]);
        busStatusData.forEach(function (statusItem) {
          const dt = moment.unix(statusItem.timestamp);
          //const unavailPoint = new StatePoint(dt, 'UNAVAIL');
          const failPoint = new StatePoint(dt, 'FAIL');
          const okPoint = new StatePoint(dt, 'OK');

          // Add online point for bus
          bus.onlinePoints.push(new StatePoint(dt, 'OK'));

          // Add state point for every pp
          bus.pp.forEach(function (ppName) {
            let found = _.find(statusItem.pp, function (ppNameInStatus) {
              return ppNameInStatus === ppName;
            });
            if (found) {
              bus.ppPoints[ppName].push(okPoint);
            }
            else {
              bus.ppPoints[ppName].push(failPoint);
            }
          });

          // Add state point for every validator
          bus.validators.forEach(function (vname) {
            let found = _.find(statusItem.validators, function (vnameInStatus) {
              return vnameInStatus === vname;
            });
            if (found) {
              bus.validatorPoints[vname].push(okPoint);
            }
            else {
              bus.validatorPoints[vname].push(failPoint);
            }
          });

        });
      });
    }

    function createGpsStatePoints(busDefines, transpStatusData) {
      busDefines.forEach(function (bus) {
        let data = _.filter(transpStatusData, ['vehicleID', bus.vehicleID]);
        bus.gpsPoints = _.map(data, function (item) {
          return new StatePoint(moment.unix(item.timestamp), item.gpsStatus);
        });
      });
    }

    function createPeriods(busDefines, dtStart, dtEnd) {
      busDefines.forEach(function (bus) {
        // Create bus periods
        bus.periods = findStatePeriods(dtStart, dtEnd, bus.onlinePoints, onlinePointMaxDistance, 'UNAVAIL');

        // Create periods for every pp
        bus.ppPeriods = {};
        bus.pp.forEach(function (name) {
          bus.ppPeriods[name] = findStatePeriods(dtStart, dtEnd,
            bus.ppPoints[name], onlinePointMaxDistance, 'UNAVAIL');
        });

        // Create periods for every validator
        bus.validatorPeriods = {};
        bus.validators.forEach(function (name) {
          bus.validatorPeriods[name] = findStatePeriods(dtStart, dtEnd,
            bus.validatorPoints[name], onlinePointMaxDistance, 'UNAVAIL');
        });
      });
    }

    function createGpsStatePeriods(busDefines, dtStart, dtEnd) {
      busDefines.forEach(function (bus) {
        bus.gpsPeriods = findStatePeriods(dtStart, dtEnd, bus.gpsPoints, onlinePointMaxDistance, 'UNAVAIL');
      });
    }

    function createStatuses(busDefines) {
      busDefines.forEach(function (bus) {
        // Bus status
        bus.status = getStatusByLastStatePeriod(bus.periods);

        // Create status for every pp
        bus.ppStatuses = {};
        bus.pp.forEach(function (name) {
          bus.ppStatuses[name] = getStatusByLastStatePeriod(bus.ppPeriods[name]);
        });

        // Create status for every validator
        bus.validatorStatuses = {};
        bus.validators.forEach(function (name) {
          bus.validatorStatuses[name] = getStatusByLastStatePeriod(bus.validatorPeriods[name]);
        });

        // GPS status
        bus.gpsStatus = getStatusByLastStatePeriod(bus.gpsPeriods);
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

    function getStatusByLastStatePeriod(periods) {
      if (!periods || periods.length === 0) {
        return 'UNKNOWN';
      }
      else {
        return periods[periods.length - 1].state;
      }
    }

    function createBusPartialPeriods(busDefines) {
      busDefines.forEach(function (bus) {
        // Find all OK periods for the bus
        const busOkPeriods = _.filter(bus.periods, ['state', 'OK']);

        // Find all FAIL periods - for all peripherial hw
        let hwFailPeriods = [];
        // PPs fail periods
        bus.pp.forEach(function (name) {
          let failPers = _.filter(bus.ppPeriods[name], ['state', 'FAIL']);
          if (failPers.length > 0) {
            hwFailPeriods = _.concat(hwFailPeriods, failPers);
          }
        });
        // Validators fail periods
        bus.validators.forEach(function (name) {
          let failPers = _.filter(bus.validatorPeriods[name], ['state', 'FAIL']);
          if (failPers.length > 0) {
            hwFailPeriods = _.concat(hwFailPeriods, failPers);
          }
        });
        // GPS fail periods
        const gpsFailPeriods = _.filter(bus.gpsPeriods, ['state', 'FAIL']);
        if (gpsFailPeriods.length > 0) {
          hwFailPeriods = _.concat(hwFailPeriods, gpsFailPeriods);
        }

        // Loop through the all OK periods and split them, if necessary
        let processedPeriods = [];
        busOkPeriods.forEach(function (okPer) {
          let warnPers = findWarnPeriods(okPer, hwFailPeriods);
          let splitResult = null;
          if (warnPers.length > 0) { // if found
            splitResult = splitPeriod(okPer, warnPers);
            processedPeriods = _.concat(processedPeriods, splitResult);
          }
          else {
            processedPeriods.push(okPer);
          }
        });

        // Re-create bus.periods.
        // Get all non-OK periods, then add processedPeriods.
        const notOkPeriods = _.filter(bus.periods, function (per) {
          return per.state !== 'OK';
        });
        bus.periods = _.concat(notOkPeriods, processedPeriods);
        // At the end, sort all periods by start asc.
        bus.periods = _.sortBy(bus.periods, function (per) {
          return per.start.unix();
        });

      }); // for every bus
    }

    function createEvents(selectedBus, busDefines, dtStart, dtEnd) {
      // Find bus info
      let events2ret = [];
      const busInfo = _.find(busDefines, ['busName', selectedBus.busName]);
      if (!busInfo) {
        return [];
      }

      // Find bus offline, online events
      const busUnavailPers = _.filter(busInfo.periods, ['state', 'UNAVAIL']);
      busUnavailPers.forEach(function (unavailPer, unavailPerInd) {
        if (!unavailPer.start.isSame(dtStart)) {
          events2ret.push(
            new BusDisconnnectedEvent(unavailPer.start, busInfo, unavailPer.end));
        }
        if (!unavailPer.end.isSame(dtEnd)) {
          // Bus Connected Event!
          // First, find the ending for this event.
          // It's either the start of next offline period or the end.
          let end = null;
          if (unavailPerInd !== busUnavailPers.length - 1) {
            end = busUnavailPers[unavailPerInd + 1].start;
          }
          else {
            end = dtEnd;
          }

          events2ret.push(
            new BusConnectedEvent(unavailPer.end, busInfo, end));
        }
      });

      // For every validator find failure and appeared events.
      busInfo.validators.forEach(function (validatorName) {
        // Failure events
        // Find fail periods
        const failPers = _.filter(busInfo.validatorPeriods[validatorName], ['state', 'FAIL']);
        // Map each fail per start => fail event
        failPers.forEach(function (failPer) {
          events2ret.push(
            new ValidatorFailEvent(failPer.start, busInfo, failPer.end, validatorName));
        });

        // Appeared events
        createAppearedEvents(busInfo, validatorName, busInfo.validatorPeriods[validatorName],
          ValidatorAppearedEvent, events2ret);

      }); // validator loop


      // For every pp find failure and appeared events.
      busInfo.pp.forEach(function (ppName) {
        // Failure events
        // Find fail periods
        const failPers = _.filter(busInfo.ppPeriods[ppName], ['state', 'FAIL']);
        // Map each fail per start => fail event
        failPers.forEach(function (failPer) {
          events2ret.push(
            new PpFailEvent(failPer.start, busInfo, failPer.end, ppName));
        });

        // Appeared events
        createAppearedEvents(busInfo, ppName, busInfo.ppPeriods[ppName], PpAppearedEvent, events2ret);

      }); // pp loop

      // Find GPS events
      // Failure events
      // Find fail periods
      const failPers = _.filter(busInfo.gpsPeriods, ['state', 'FAIL']);
      // Map each fail per start => fail event
      failPers.forEach(function (failPer) {
        events2ret.push(
          new GpsFailEvent(failPer.start, busInfo, failPer.end));
      });
      // Appeared events
      createAppearedEvents(busInfo, new GpsEvent().getComponentName(), busInfo.gpsPeriods, GpsAppearedEvent, events2ret);

      // Sort all events by timestamp desc
      events2ret = _.sortBy(events2ret, function (event) {
        return -event.timestamp.unix();
      });

      return events2ret;
    }

    function createAppearedEvents(bus, componentName, periods, appearedEventCls, events) {
      let i = 0;
      // Go through all periods
      while (i < periods.length) {
        let curPer = periods[i];
        // Find fail per
        if (curPer.state === 'FAIL') {
          const failPer = curPer;
          // Find next OK per
          let nextOkPer = null;
          let j = i + 1;
          while (j < periods.length) {
            if (periods[j].state === 'OK') {
              nextOkPer = periods[j];
              break;
            }
            else {
              j++;
            }
          }
          // if found
          if (nextOkPer) {
            events.push(
              new appearedEventCls(nextOkPer.start, bus, nextOkPer.end, componentName));
          }
          i = j + 1;
        }
        else {
          i++;
        }
      }
    }

    function log(msg) {
      $log.debug(msg);
    }

    return ({
      getBusDefines:  getBusDefines,
      createEvents:   createEvents
    });

  }
);
