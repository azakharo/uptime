"use strict";

class Period extends DateRange {
  constructor(start, end) {
    super(start, end);
    //this.type = null;
  }

  toString() {
    const timeFrmt = 'YYYY-MM-DD HH:mm:ss';
    const start = this.start.format(timeFrmt);
    const end = this.end.format(timeFrmt);
    return `${start} - ${end}`;
  }
}

class OnlinePeriod extends Period {
  //constructor(start, end) {
  //  super(start, end);
  //  this.type = "online";
  //}

  toString() {
    return super.toString() + ' online';
  }
}

class OfflinePeriod extends Period {
  //constructor(start, end) {
  //  super(start, end);
  //  this.type = "offline";
  //}

  toString() {
    return super.toString() + ' offline';
  }
}

let onlinePointMaxDistance = 6 * 60; // sec

// maxPointDistance in sec
function findPeriods(start, end, onlinePoints, maxPointDistance) {
  if (start.isSame(end) || start.isAfter(end)) {
    throw "Invalid start parameter";
  }
  if (!onlinePoints || onlinePoints.length === 0) {
    // Return 1 offline period from start to end
    return [ new OfflinePeriod(start, end) ];
  }

  // Ignore points before start and after end
  let points = _.filter(onlinePoints, function (p) {
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
      // if longer than limit, then add the offline period
      curPeriod = new OfflinePeriod(
        start,
        points[0].timestamp.clone().subtract(1, 'seconds'));
      periods.push(curPeriod);
      // Then start from the 1st point
      curPeriod = new OnlinePeriod(points[0].timestamp, null);
    }
    else {
      // Start from the start
      curPeriod = new OnlinePeriod(start, null);
    }
  }
  else {
    curPeriod = new OnlinePeriod(start, null);
  }

  for (let i = 1; i < points.length; i++) {
    let curPoint = points[i];
    let prevPoint = points[i - 1];

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

function logPeriods(periods) {
  periods.forEach(function (per, ind) {
    log(`${ind+1}: ${per.toString()}`);
  });
}


/////////////////////////////////////////////////
// Tests

var testTimePointFrmt = "YYYY-MM-DD HH:mm:ss";
const onlinePointMaxDistanceTest = 5 * 60; // sec

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
    points, onlinePointMaxDistanceTest);
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
    points, onlinePointMaxDistanceTest);
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
  let periods = findPeriods(start, end, points, onlinePointMaxDistanceTest);
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
  let periods = findPeriods(start, end, points, onlinePointMaxDistanceTest);
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
  let periods = findPeriods(start, end, points, onlinePointMaxDistanceTest);

  //logPeriods(periods);

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

function testPointsBeyondBoundaries() {
  let points = [
    new OnlinePoint(moment("2016-01-27 05:58:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:05:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:55:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 07:01:00", testTimePointFrmt))
  ];

  let start = moment("2016-01-27 06:00:00", testTimePointFrmt);
  let end = moment("2016-01-27 07:00:00", testTimePointFrmt);
  let periods = findPeriods(start, end, points, onlinePointMaxDistanceTest);

  //logPeriods(periods);

  if (periods.length !== 3) {
    throw "periods.length !== 3";
  }
  let onlinePers =_.filter(periods, function (per) {
    return per instanceof OnlinePeriod;
  });
  if (onlinePers.length !== 2) {
    throw "onlinePers.length !== 2";
  }
  let offlinePers=_.filter(periods, function (per) {
    return per instanceof OfflinePeriod;
  });
  if (offlinePers.length !== 1) {
    throw "offlinePers.length !== 1";
  }
}

function testTwoCombinedOnlines() {
  let points = [
    new OnlinePoint(moment("2016-01-27 06:25:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:30:00", testTimePointFrmt)),
  ];

  let start = moment("2016-01-27 06:00:00", testTimePointFrmt);
  let end = moment("2016-01-27 07:00:00", testTimePointFrmt);
  let periods = findPeriods(start, end, points, onlinePointMaxDistanceTest);

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
}

function testTwoSeparateOnlines() {
  let points = [
    new OnlinePoint(moment("2016-01-27 06:25:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:31:00", testTimePointFrmt)),
  ];

  let start = moment("2016-01-27 06:00:00", testTimePointFrmt);
  let end = moment("2016-01-27 07:00:00", testTimePointFrmt);
  let periods = findPeriods(start, end, points, onlinePointMaxDistanceTest);

  //logPeriods(periods);

  if (periods.length !== 5) {
    throw "periods.length !== 4";
  }
  let onlinePers =_.filter(periods, function (per) {
    return per instanceof OnlinePeriod;
  });
  if (onlinePers.length !== 2) {
    throw "onlinePers.length !== 2";
  }
  let offlinePers=_.filter(periods, function (per) {
    return per instanceof OfflinePeriod;
  });
  if (offlinePers.length !== 3) {
    throw "offlinePers.length !== 2";
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

  log('testPointsBeyondBoundaries');
  testPointsBeyondBoundaries();

  log('testTwoCombinedOnlines');
  testTwoCombinedOnlines();

  log('testTwoSeparateOnlines');
  testTwoSeparateOnlines();
}
//runTests();

function log(msg) {
  console.log(msg);
}
