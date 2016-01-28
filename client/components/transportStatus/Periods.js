"use strict";

class Period {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  toString() {
    const timeFrmt = 'YYYY-MM-DD HH:mm:ss';
    const start = this.start.format(timeFrmt);
    const end = this.end.format(timeFrmt);
    return `${start} - ${end}`;
  }
}

class OnlinePeriod extends Period {
  toString() {
    return super.toString() + ' online';
  }
}

class OfflinePeriod extends Period {
  toString() {
    return super.toString() + ' offline';
  }
}

let onlinePointDistance = 5 * 60; // sec

// maxPointDistance in sec
function findPeriods (start, end, onlinePoints, maxPointDistance) {
  let periods = [];
  if (!onlinePoints || onlinePoints.length === 0) {
    return periods;
  }
  if (start.isAfter(onlinePoints[0].timestamp)) {
    throw "start is after 1st point";
  }
  if (end.isBefore(onlinePoints[onlinePoints.length - 1].timestamp)) {
    throw "end is before last point";
  }

  let curPeriod = null;

  // Handle the beginning
  if (!start.isSame(onlinePoints[0].timestamp)) {
    // Find out the diff between the start and 1st point
    if (onlinePoints[0].timestamp.diff(start, 'seconds', true) >= maxPointDistance) {
      // if longer than limit, then add the offline period
      curPeriod = new OfflinePeriod(
        start,
        onlinePoints[0].timestamp.clone().subtract(1, 'seconds'));
      periods.push(curPeriod);
      // Then start from the 1st point
      curPeriod = new OnlinePeriod(onlinePoints[0].timestamp, null);
    }
    else {
      // Start from the start
      curPeriod = new OnlinePeriod(start, null);
    }
  }
  else {
    curPeriod = new OnlinePeriod(start, null);
  }

  for (let i = 1; i < onlinePoints.length; i++) {
    let curPoint = onlinePoints[i];
    let isLastPoint = (i === onlinePoints.length - 1);
    let prevPoint = onlinePoints[i - 1];

    if (curPeriod instanceof OfflinePeriod) {
      // Finish period and start new online period, if not last point
      curPeriod.end = curPoint.timestamp.clone().subtract(1, 'seconds');
      periods.push(curPeriod);
      if (!isLastPoint) {
        curPeriod = new OnlinePeriod(curPoint.timestamp, null);
      }
      else {
        curPeriod = null;
      }
    }
    else if (curPeriod instanceof OnlinePeriod) {
      // Find out whether the difference between prevPoint and curPoint is longer than maxPointDistance
      if (curPoint.timestamp.diff(prevPoint.timestamp, 'seconds', true) >= maxPointDistance) { // if longer
        // Finish cur online per
        curPeriod.end = prevPoint.timestamp.clone().add(maxPointDistance, 'seconds').subtract(1, 'seconds');
        periods.push(curPeriod);
        // Add new offline per
        curPeriod = new OfflinePeriod(
          prevPoint.timestamp.clone().add(maxPointDistance, 'seconds'),
          curPoint.timestamp.clone().subtract(1, 'seconds'));
        periods.push(curPeriod);
        // Start new online per, if not last point
        if (!isLastPoint) {
          curPeriod = new OnlinePeriod(curPoint.timestamp, null);
        }
        else {
          curPeriod = null;
        }
      }
      else {
        // If this is the last point then finish the cur per
        if (isLastPoint) {
          curPeriod.end = curPoint.timestamp;
          periods.push(curPeriod);
          curPeriod = null;
        }
      }
    }
    else {
      throw "UNEXPECTED period type";
    }
  }

  return periods;
}

function log(msg) {
  console.log(msg);
}

function logPeriods(periods) {
  periods.forEach(function (per, ind) {
    log(`${ind+1}: ${per.toString()}`);
  });
}


/////////////////////////////////////////////////
// Tests

const testTimePointFrmt = "YYYY-MM-DD HH:mm:ss";
const testMaxPointDist = 5 * 60; // sec

function testAlwaysOnline() {
  let points = [
    new OnlinePoint(moment("2016-01-27 06:00:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:03:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:07:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:10:00", testTimePointFrmt))
  ];

  let periods = findPeriods(
    moment("2016-01-27 06:00:00", testTimePointFrmt),
    moment("2016-01-27 06:10:00", testTimePointFrmt),
    points, testMaxPointDist);
  logPeriods(periods);
  //expect(periods.length).toEqual(1);
}

function testShortTimeLimit() {
  let points = [
    new OnlinePoint(moment("2016-01-27 06:00:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:03:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:07:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:10:00", testTimePointFrmt))
  ];

  let periods = findPeriods(
    moment("2016-01-27 06:00:00", testTimePointFrmt),
    moment("2016-01-27 06:10:00", testTimePointFrmt),
    points, 60);
  logPeriods(periods);
  //expect(2).toEqual(2);
}

// 2. Almost always offline, 1 short online per in the middle
// 3. Online, offline, online


function runTests() {
  log('testAlwaysOnline');
  testAlwaysOnline();

  log('testShortTimeLimit');
  testShortTimeLimit();
}
runTests();
