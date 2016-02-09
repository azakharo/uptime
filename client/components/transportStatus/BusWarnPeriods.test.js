"use strict";

function testNoOverlap() {
  log('testNoOverlap');
  const okPer = new StatePeriod(
    moment("2016-02-09 06:00:00", testTimePointFrmt),
    moment("2016-02-09 07:00:00", testTimePointFrmt),
    'OK');

  const failPers = [
    new StatePeriod(
      moment("2016-02-09 05:00:00", testTimePointFrmt),
      moment("2016-02-09 06:00:00", testTimePointFrmt),
      'FAIL'),
    new StatePeriod(
      moment("2016-02-09 07:00:00", testTimePointFrmt),
      moment("2016-02-09 08:00:00", testTimePointFrmt),
      'FAIL')
  ];

  let warnPers = findWarnPeriods(okPer, failPers);
  //logPeriods(warnPers);

  if (warnPers.length === 0) {
    throw "warnPers.length !== 0";
  }
}

function testWholeOverlap() {
  log('testWholeOverlap');
  const okPer = new StatePeriod(
    moment("2016-02-09 06:00:00", testTimePointFrmt),
    moment("2016-02-09 07:00:00", testTimePointFrmt),
    'OK');

  const failPers = [
    new StatePeriod(
      moment("2016-02-09 05:00:00", testTimePointFrmt),
      moment("2016-02-09 09:00:00", testTimePointFrmt),
      'FAIL'),
    new StatePeriod(
      moment("2016-02-09 10:00:00", testTimePointFrmt),
      moment("2016-02-09 11:00:00", testTimePointFrmt),
      'FAIL')
  ];

  let warnPers = findWarnPeriods(okPer, failPers);
  //logPeriods(warnPers);

  if (warnPers.length === 1) {
    throw "warnPers.length !== 1";
  }
}

function testPerCombi() {
  log('testPerCombi');
  const okPer = new StatePeriod(
    moment("2016-02-09 06:00:00", testTimePointFrmt),
    moment("2016-02-09 07:00:00", testTimePointFrmt),
    'OK');

  const failPer1start = moment("2016-02-09 06:10:00", testTimePointFrmt);
  const failPer1end   = moment("2016-02-09 06:15:00", testTimePointFrmt);
  const failPer2start = moment("2016-02-09 06:20:00", testTimePointFrmt);
  const failPer2end   = moment("2016-02-09 06:30:00", testTimePointFrmt);
  const failPer3start = moment("2016-02-09 06:25:00", testTimePointFrmt);
  const failPer3end   = moment("2016-02-09 06:35:00", testTimePointFrmt);
  const failPer4start = moment("2016-02-09 06:45:00", testTimePointFrmt);
  const failPer4end   = moment("2016-02-09 06:50:00", testTimePointFrmt);

  const failPers = [
    new StatePeriod(failPer1start, failPer1end, 'FAIL'),
    new StatePeriod(failPer2start, failPer2end, 'FAIL'),
    new StatePeriod(failPer3start, failPer3end, 'FAIL'),
    new StatePeriod(failPer4start, failPer4end, 'FAIL')
  ];

  let warnPers = findWarnPeriods(okPer, failPers);
  //logPeriods(warnPers);

  if (warnPers.length === 3) {
    throw "warnPers.length !== 3";
  }
  // check 1 warn per
  if (!warnPers[0].start.isSame(failPer1start)) {
    throw "warn per1 incorrect start";
  }
  if (!warnPers[0].end.isSame(failPer1end)) {
    throw "warn per1 incorrect end";
  }
  // check 2 warn per
  if (!warnPers[1].start.isSame(failPer2start)) {
    throw "warn per2 incorrect start";
  }
  if (!warnPers[1].end.isSame(failPer3end)) {
    throw "warn per2 incorrect end";
  }
  // check 3 warn per
  if (!warnPers[2].start.isSame(failPer4start)) {
    throw "warn per3 incorrect start";
  }
  if (!warnPers[2].end.isSame(failPer4end)) {
    throw "warn per3 incorrect end";
  }
}


function runBusWarnPerTests() {
  //testNoOverlap();
  //testWholeOverlap();
  //testPerCombi();
}
