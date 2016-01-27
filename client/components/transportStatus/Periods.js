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
}

class OfflinePeriod extends Period {
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
    let nextPoint = onlinePoints[i];
    let prevPoint = onlinePoints[i - 1];

    // if this is the last point then finish the cur per
    if (i === onlinePoints.length - 1) {
      curPeriod.end = nextPoint.timestamp;
      periods.push(curPeriod);
      continue;
    }

    // if current period is offline, then finish it and start new online period, continue
    if (curPeriod instanceof OfflinePeriod) {
      curPeriod.end = nextPoint.timestamp.clone().subtract(1, 'seconds');
      periods.push(curPeriod);
      curPeriod = new OnlinePeriod(nextPoint.timestamp, null);
      continue;
    }

    // Find out whether the difference between curPer.start and nextPoint is longer than maxPointDistance
    if (nextPoint.timestamp.diff(prevPoint.timestamp, 'seconds', true) > maxPointDistance) {
      // if longer, then finish cur online per and start new offline per
      curPeriod.end = nextPoint.timestamp.clone().add(5, 'minutes').subtract(1, 'seconds');
      periods.push(curPeriod);
      curPeriod = new OfflinePeriod(nextPoint.timestamp.clone().add(5, 'minutes'), null);
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
testAlwaysOnline();

// 2. Almost always offline, 1 short online per in the middle
// 3. Online, offline, online

// Tests
///////////////////////////////////////////////////////////////////////////////
