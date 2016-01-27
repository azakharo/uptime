'use strict';

describe('findPeriods', function () {

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

  it('always online', function () {
    let points = [
      new OnlinePoint(moment("2016-01-27 06:00:00", testTimePointFrmt)),
      new OnlinePoint(moment("2016-01-27 06:03:00", testTimePointFrmt)),
      new OnlinePoint(moment("2016-01-27 06:07:00", testTimePointFrmt)),
      new OnlinePoint(moment("2016-01-27 06:10:00", testTimePointFrmt))
    ];

    let periods = findPeriods(points, testMaxPointDist);
    logPeriods(periods);
    expect(periods.length).toEqual(1);
  });

  // 2. Almost always offline, 1 short online per in the middle
  // 3. Online, offline, online

  it('very short time limit', function () {
    let points = [
      new OnlinePoint(moment("2016-01-27 06:00:00", testTimePointFrmt)),
      new OnlinePoint(moment("2016-01-27 06:03:00", testTimePointFrmt)),
      new OnlinePoint(moment("2016-01-27 06:07:00", testTimePointFrmt)),
      new OnlinePoint(moment("2016-01-27 06:10:00", testTimePointFrmt))
    ];

    let periods = findPeriods(points, 60);
    logPeriods(periods);
    expect(1).toEqual(1);
  });
});
