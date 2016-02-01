"use strict";

class StatePoint {
  constructor(t, state) {
    this.timestamp = t;
    this.state = state;
  }

  toString() {
    return this.timestamp.format('YYYY-MM-DD HH:mm:ss') + ' ' + this.state;
  }
}

class StatePeriod extends Period {
  constructor(start, end, state) {
    super(start, end);
    this.state = state;
  }

  toString() {
    return super.toString() + ' ' + this.state;
  }
}


// maxPointDistance in sec
function findStatePeriods(start, end, statePoints, maxPointDistance, unavailState) {
  if (start.isSame(end) || start.isAfter(end)) {
    throw "Invalid start parameter";
  }
  if (!statePoints || statePoints.length === 0) {
    // Return 1 unavailable period from start to end
    return [ new StatePeriod(start, end, unavailState) ];
  }

  // Ignore points before start and after end
  let points = _.filter(statePoints, function (p) {
    return p.timestamp.isAfter(start) || p.timestamp.isSame(start);
  });
  points = _.filter(points, function (p) {
    return p.timestamp.isBefore(end) || p.timestamp.isSame(end);
  });

  let periods = [];
  let curPeriod = null;

  // Handle the beginning
  if (!start.isSame(points[0].timestamp)) {
    // Find out the diff between the start and 1st point
    if (points[0].timestamp.diff(start, 'seconds', true) > maxPointDistance) {
      // if longer than limit, then add the unavail period
      curPeriod = new StatePeriod(start,
        points[0].timestamp.clone().subtract(1, 'seconds'),
        unavailState);
      periods.push(curPeriod);
      // Then start from the 1st point
      curPeriod = new StatePeriod(points[0].timestamp, null, points[0].state);
    }
    else {
      // Start from the start
      curPeriod = new StatePeriod(start, null, points[0].state);
    }
  }
  else {
    curPeriod = new StatePeriod(start, null, points[0].state);
  }

  for (let i = 1; i < points.length; i++) {
    let curPoint = points[i];
    let prevPoint = points[i - 1];

    if (curPeriod.state === unavailState) {
      // Finish period and start new period
      curPeriod.end = curPoint.timestamp.clone().subtract(1, 'seconds');
      periods.push(curPeriod);
      curPeriod = new StatePeriod(curPoint.timestamp, null, curPoint.state);
    }
    else {
      // Find out whether the difference between prevPoint and curPoint is longer than maxPointDistance
      if (curPoint.timestamp.diff(prevPoint.timestamp, 'seconds', true) > maxPointDistance) { // if longer
        // Finish cur per
        curPeriod.end = prevPoint.timestamp.clone().add(maxPointDistance, 'seconds');
        periods.push(curPeriod);
        // Add new unavail per
        curPeriod = new StatePeriod(
          prevPoint.timestamp.clone().add(maxPointDistance, 'seconds').add(1, 'seconds'),
          curPoint.timestamp.clone().subtract(1, 'seconds'),
          unavailState);
        periods.push(curPeriod);
        // Start new per
        curPeriod = new StatePeriod(curPoint.timestamp, null, curPoint.state);
      }
      else {
        if (curPeriod.state !== curPoint.state) {
          // Finish cur per
          curPeriod.end = curPoint.timestamp.clone().subtract(1, 'seconds');
          periods.push(curPeriod);
          // Start new per
          curPeriod = new StatePeriod(curPoint.timestamp, null, curPoint.state);
        }
        else {
          // same state -> do nothing
        }
      }
    }
  } // point loop

  // Handle the ending
  let lastPoint = points[points.length - 1];
  if (end.isSame(lastPoint.timestamp)) {
    if (!curPeriod.start.isSame(end)) {
      curPeriod.end = end;
      periods.push(curPeriod);
    }
  }
  else {
    // Find out the diff
    if (end.diff(lastPoint.timestamp, 'seconds', true) > maxPointDistance) {
      // If the diff is longer or equal than limit => add avail and unavail periods
      curPeriod.end = lastPoint.timestamp.clone().add(maxPointDistance, 'seconds');
      periods.push(curPeriod);
      // Add new unavail per
      curPeriod = new StatePeriod(
        lastPoint.timestamp.clone().add(maxPointDistance, 'seconds').add(1, 'seconds'),
        end,unavailState);
      periods.push(curPeriod);
    }
    else {
      curPeriod.end = end;
      periods.push(curPeriod);
    }
  }

  return periods;
}


///////////////////////////////////////////////////////////////////////////////
// Tests

function testAlwaysOK() {
  let points = [
    new StatePoint(moment("2016-01-27 06:00:00", testTimePointFrmt), 'OK'),
    new StatePoint(moment("2016-01-27 06:05:00", testTimePointFrmt), 'OK'),
    new StatePoint(moment("2016-01-27 06:10:00", testTimePointFrmt), 'OK'),
    new StatePoint(moment("2016-01-27 06:15:00", testTimePointFrmt), 'OK')
  ];

  let periods = findStatePeriods(
    moment("2016-01-27 06:00:00", testTimePointFrmt),
    moment("2016-01-27 06:15:00", testTimePointFrmt),
    points, onlinePointMaxDistanceTest, 'FAIL');
  //logPeriods(periods);
  if (periods.length !== 1) {
    throw "periods.length !== 1";
  }
  if (periods[0].state !== 'OK') {
    throw "NOT OK period state";
  }
}

function testOneShortOK() {
  let points = [
    new StatePoint(moment("2016-01-27 12:04:00", testTimePointFrmt), 'OK')
  ];

  let periods = findStatePeriods(
    moment("2016-01-27 06:00:00", testTimePointFrmt),
    moment("2016-01-27 16:10:00", testTimePointFrmt),
    points, onlinePointMaxDistanceTest, 'FAIL');
  logPeriods(periods);
  if (periods.length !== 3) {
    throw "periods.length !== 3";
  }
  let okPers =_.filter(periods, function (per) {
    return per.state === 'OK';
  });
  if (okPers.length !== 1) {
    throw "okPers.length !== 1";
  }
  let unavailPers =_.filter(periods, function (per) {
    return per.state === 'FAIL';
  });
  if (unavailPers.length !== 2) {
    throw "unavailPers.length !== 2";
  }
}


function runTests() {
  log('testAlwaysOK');
  testAlwaysOK();

  log('testOneShortOK');
  testOneShortOK();

  //log('testAlwaysUnavail');
  //testAlwaysUnavail();
  //
  //log('testTwoCombinedOK');
  //testTwoCombinedOK();
  //
  //log('testTwoSeparateOK');
  //testTwoSeparateOK();
  //
  //log('testOkNoSatelliteOk');
  //testOkNoSatelliteOk();
}
runTests();
