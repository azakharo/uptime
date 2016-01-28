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
function findPeriods(start, end, onlinePoints, maxPointDistance) {
  if (!onlinePoints || onlinePoints.length === 0) {
    // Return 1 offline period from start to end
    return [ new OfflinePeriod(start, end) ];
  }
  if (start.isAfter(onlinePoints[0].timestamp)) {
    throw "start is after 1st point";
  }
  if (end.isBefore(onlinePoints[onlinePoints.length - 1].timestamp)) {
    throw "end is before last point";
  }

  let periods = [];
  let curPeriod = null;

  // Handle the beginning
  if (!start.isSame(onlinePoints[0].timestamp)) {
    // Find out the diff between the start and 1st point
    if (onlinePoints[0].timestamp.diff(start, 'seconds', true) > maxPointDistance) {
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
    let prevPoint = onlinePoints[i - 1];

    if (curPeriod instanceof OfflinePeriod) {
      // Finish period and start new online period
      curPeriod.end = curPoint.timestamp.clone().subtract(1, 'seconds');
      periods.push(curPeriod);
      curPeriod = new OnlinePeriod(curPoint.timestamp, null);
    }
    else if (curPeriod instanceof OnlinePeriod) {
      // Find out whether the difference between prevPoint and curPoint is longer than maxPointDistance
      if (curPoint.timestamp.diff(prevPoint.timestamp, 'seconds', true) > maxPointDistance) { // if longer
        // Finish cur online per
        curPeriod.end = prevPoint.timestamp.clone().add(maxPointDistance, 'seconds');
        periods.push(curPeriod);
        // Add new offline per
        curPeriod = new OfflinePeriod(
          prevPoint.timestamp.clone().add(maxPointDistance, 'seconds').add(1, 'seconds'),
          curPoint.timestamp.clone().subtract(1, 'seconds'));
        periods.push(curPeriod);
        // Start new online per
        curPeriod = new OnlinePeriod(curPoint.timestamp, null);
      }
      else {
        // Do nothing
      }
    }
    else {
      throw "UNEXPECTED period type";
    }
  } // point loop

  // Handle the ending
  let lastPoint = onlinePoints[onlinePoints.length - 1];
  if (end.isSame(lastPoint.timestamp)) {
    if (!curPeriod.start.isSame(end)) {
      curPeriod.end = end;
      periods.push(curPeriod);
    }
  }
  else {
    // Find out the diff
    if (end.diff(lastPoint.timestamp, 'seconds', true) > maxPointDistance) {
      // If the diff is longer or equal than limit => add online and offline periods
      curPeriod.end = lastPoint.timestamp.clone().add(maxPointDistance, 'seconds');
      periods.push(curPeriod);
      // Add new offline per
      curPeriod = new OfflinePeriod(
        lastPoint.timestamp.clone().add(maxPointDistance, 'seconds').add(1, 'seconds'),
        end);
      periods.push(curPeriod);
    }
    else {
      // otherwise and 1 online period
      curPeriod.end = end;
      periods.push(curPeriod);
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
  //logPeriods(periods);
  if (periods.length !== 1) {
    throw "periods.length !== 1";
  }
  if (!(periods[0] instanceof OnlinePeriod)) {
    throw "!instanceof OnlinePeriod";
  }
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
  //logPeriods(periods);
  if (periods.length !== 6) {
    throw "periods.length !== 6";
  }
  let onlinePerCount =_.filter(periods, function (per) {
    return per instanceof OnlinePeriod;
  });
  if (onlinePerCount.length !== 3) {
    throw "onlinePerCount.length !== 3";
  }
  let offlinePerCount =_.filter(periods, function (per) {
    return per instanceof OfflinePeriod;
  });
  if (offlinePerCount.length !== 3) {
    throw "onlinePerCount.length !== 3";
  }
}

// Almost always offline, 1 short online per in the middle
function testOneShortOnline() {
  let points = [
    new OnlinePoint(moment("2016-01-27 12:04:00", testTimePointFrmt)),
  ];

  let periods = findPeriods(
    moment("2016-01-27 06:00:00", testTimePointFrmt),
    moment("2016-01-27 16:10:00", testTimePointFrmt),
    points, onlinePointDistance);
  //logPeriods(periods);
  if (periods.length !== 3) {
    throw "periods.length !== 3";
  }
  let onlinePerCount =_.filter(periods, function (per) {
    return per instanceof OnlinePeriod;
  });
  if (onlinePerCount.length !== 1) {
    throw "onlinePerCount.length !== 1";
  }
  let offlinePerCount =_.filter(periods, function (per) {
    return per instanceof OfflinePeriod;
  });
  if (offlinePerCount.length !== 2) {
    throw "onlinePerCount.length !== 2";
  }
}

function testStartEndExceedSmall() {
  let points = [
    new OnlinePoint(moment("2016-01-27 06:00:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:05:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:10:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:15:00", testTimePointFrmt))
  ];

  let start = moment("2016-01-27 05:58:00", testTimePointFrmt);
  let end = moment("2016-01-27 06:18:00", testTimePointFrmt);
  let periods = findPeriods(start, end, points, onlinePointDistance);
  //logPeriods(periods);
  if (periods.length !== 1) {
    throw "periods.length !== 1";
  }
  let onlinePerCount =_.filter(periods, function (per) {
    return per instanceof OnlinePeriod;
  });
  if (onlinePerCount.length !== 1) {
    throw "onlinePerCount.length !== 1";
  }
  if (!periods[0].start.isSame(start)) {
    throw "wrong start";
  }
  if (!periods[periods.length - 1].end.isSame(end)) {
    throw "wrong end";
  }
}

function testStartEndExceedBig() {
  let points = [
    new OnlinePoint(moment("2016-01-27 06:00:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:05:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:10:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:15:00", testTimePointFrmt))
  ];

  let start = moment("2016-01-27 05:54:00", testTimePointFrmt);
  let end = moment("2016-01-27 06:21:00", testTimePointFrmt);
  let periods = findPeriods(start, end, points, onlinePointDistance);
  //logPeriods(periods);
  if (periods.length !== 3) {
    throw "periods.length !== 3";
  }
  let onlinePers =_.filter(periods, function (per) {
    return per instanceof OnlinePeriod;
  });
  if (onlinePers.length !== 1) {
    throw "onlinePers.length !== 1";
  }
  let offlinePers=_.filter(periods, function (per) {
    return per instanceof OfflinePeriod;
  });
  if (offlinePers.length !== 2) {
    throw "offlinePers.length !== 2";
  }
  if (!onlinePers[0].start.isSame(points[0].timestamp)) {
    throw "wrong start";
  }
  if (!onlinePers[onlinePers.length - 1].end.isSame(moment("2016-01-27 06:20:00", testTimePointFrmt))) {
    throw "wrong end";
  }
}

function testOffline() {
  let points = [];

  let start = moment("2016-01-27 05:54:00", testTimePointFrmt);
  let end = moment("2016-01-27 06:21:00", testTimePointFrmt);
  let periods = findPeriods(start, end, points, onlinePointDistance);

  logPeriods(periods);

  if (periods.length !== 1) {
    throw "periods.length !== 1";
  }
  let offlinePers=_.filter(periods, function (per) {
    return per instanceof OfflinePeriod;
  });
  if (offlinePers.length !== 1) {
    throw "offlinePers.length !== 1";
  }
}


function runTests() {
  log('testAlwaysOnline');
  testAlwaysOnline();

  log('testShortTimeLimit');
  testShortTimeLimit();

  log('testOneShortOnline');
  testOneShortOnline();

  log('testStartEndExceedSmall');
  testStartEndExceedSmall();

  log('testStartEndExceedBig');
  testStartEndExceedBig();

  log('testOffline');
  testOffline();
}
runTests();
