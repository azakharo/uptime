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
function findPeriods (onlinePoints, maxPointDistance) {
  let periods = [];
  if (!onlinePoints || onlinePoints.length === 0 || onlinePoints.length === 1) {
    return periods;
  }
  let curPeriod = new OnlinePeriod(onlinePoints[0].timestamp, null);
  for (let i = 1; i < onlinePoints.length; i++) {
    let curPoint = onlinePoints[i];
    let prevPoint = onlinePoints[i - 1];

    // if current period is offline, then finish it and start new online period, continue
    if (curPeriod instanceof OfflinePeriod) {
      curPeriod.end = curPoint.timestamp.clone().subtract(1, 'seconds');
      periods.push(curPeriod);
      curPeriod = new OnlinePeriod(curPoint.timestamp, null);
      continue;
    }

    // Find out whether the difference between prevPoint and curPoint is longer than maxPointDistance
    if (curPoint.timestamp.diff(prevPoint.timestamp, 'seconds', true) >= maxPointDistance) {
      // if longer, then finish cur online per
      curPeriod.end = prevPoint.timestamp.clone().add(maxPointDistance, 'seconds').subtract(1, 'seconds');
      periods.push(curPeriod);
      // Add new offline per
      curPeriod = new OfflinePeriod(
        prevPoint.timestamp.clone().add(maxPointDistance, 'seconds'),
        curPoint.timestamp.clone().subtract(1, 'seconds'));
      periods.push(curPeriod);
      if (i === onlinePoints.length - 1) {
        // Start new online per
        curPeriod = new OnlinePeriod(
          curPoint.timestamp,
          null);
      }
      continue;
    }

    // if this is the last point then finish the cur per
    if (i === onlinePoints.length - 1) {
      curPeriod.end = curPoint.timestamp;
      periods.push(curPeriod);
    }

  }

  return periods;
}

///////////////////////////////////////////////////////////////////////////////
// Tests

const testTimePointFrmt = "YYYY-MM-DD HH:mm:ss";
const testMaxPointDist = 5 * 60; // sec

function log(msg) {
  console.log(msg);
}

function logPeriods(periods) {
  periods.forEach(function (per, ind) {
    log(`${ind+1}: ${per.toString()}`);
  });
}

// 1. Always online - 1 big online per
function testAlwaysOnline() {
  let points = [
    new OnlinePoint(moment("2016-01-27 06:00:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:03:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:07:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:10:00", testTimePointFrmt))
  ];

  let periods = findPeriods(points, testMaxPointDist);
  logPeriods(periods);
}
log('testAlwaysOnline');
testAlwaysOnline();

// 2. Almost always offline, 1 short online per in the middle
// 3. Online, offline, online

// 4. Very short time limit
function testVeryShortTimeLimit() {
  let points = [
    new OnlinePoint(moment("2016-01-27 06:00:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:03:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:07:00", testTimePointFrmt)),
    new OnlinePoint(moment("2016-01-27 06:10:00", testTimePointFrmt))
  ];

  let periods = findPeriods(points, 60);
  logPeriods(periods);
}
log('testVeryShortTimeLimit');
testVeryShortTimeLimit();

// Tests
///////////////////////////////////////////////////////////////////////////////
