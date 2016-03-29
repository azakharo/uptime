"use strict";

/////////////////////////////////////////////////////////////////////
// test find warn periods

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

  if (warnPers.length !== 0) {
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

  if (warnPers.length !== 1) {
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

  if (warnPers.length !== 3) {
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

function testPerCombi2() {
  log('testPerCombi2');
  const okPer = new StatePeriod(
    moment("2016-02-09 06:00:00", testTimePointFrmt),
    moment("2016-02-09 07:00:00", testTimePointFrmt),
    'OK');

  const failPer1start = moment("2016-02-09 06:10:00", testTimePointFrmt);
  const failPer1end   = moment("2016-02-09 06:15:00", testTimePointFrmt);
  const failPer2start = moment("2016-02-09 06:20:00", testTimePointFrmt);
  const failPer2end   = moment("2016-02-09 06:35:00", testTimePointFrmt);
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

  if (warnPers.length !== 3) {
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
  if (!warnPers[1].end.isSame(failPer2end)) {
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

/////////////////////////////////////////////////////////////////////
// test splitPeriod

function testLeftSubPer() {
  log('testLeftSubPer');
  const mainPerStart = moment("2016-02-09 06:00:00", testTimePointFrmt);
  const mainPerEnd = moment("2016-02-09 07:00:00", testTimePointFrmt);
  const okPer = new StatePeriod(mainPerStart, mainPerEnd, 'OK');

  const subPerStart = moment("2016-02-09 06:00:00", testTimePointFrmt);
  const subPerEnd = moment("2016-02-09 06:10:00", testTimePointFrmt);
  const subPers = [new StatePeriod(subPerStart, subPerEnd, 'PARTIAL')];

  let pers = splitPeriod(okPer, subPers);
  //logPeriods(pers);

  if (pers.length !== 2) {
    throw "pers.length !== 2";
  }
  checkPeriod(pers[0], subPerStart, subPerEnd, 'PARTIAL', 1);
  checkPeriod(pers[1], subPerEnd, mainPerEnd, 'OK', 2);
}

function testMidSubPer() {
  log('testMidSubPer');
  const mainPerStart = moment("2016-02-09 06:00:00", testTimePointFrmt);
  const mainPerEnd = moment("2016-02-09 07:00:00", testTimePointFrmt);
  const okPer = new StatePeriod(mainPerStart, mainPerEnd, 'OK');

  const subPerStart = moment("2016-02-09 06:25:00", testTimePointFrmt);
  const subPerEnd = moment("2016-02-09 06:35:00", testTimePointFrmt);
  const subPers = [new StatePeriod(subPerStart, subPerEnd, 'PARTIAL')];

  let pers = splitPeriod(okPer, subPers);
  //logPeriods(pers);

  if (pers.length !== 3) {
    throw "pers.length !== 3";
  }
  // check 1 per
  checkPeriod(pers[0], mainPerStart, subPerStart, 'OK', 1);
  checkPeriod(pers[1], subPerStart, subPerEnd, 'PARTIAL', 2);
  checkPeriod(pers[2], subPerEnd, mainPerEnd, 'OK', 3);
}

function testRightSubPer() {
  log('testRightSubPer');
  const mainPerStart = moment("2016-02-09 06:00:00", testTimePointFrmt);
  const mainPerEnd = moment("2016-02-09 07:00:00", testTimePointFrmt);
  const okPer = new StatePeriod(mainPerStart, mainPerEnd, 'OK');

  const subPerStart = moment("2016-02-09 06:45:00", testTimePointFrmt);
  const subPerEnd = moment("2016-02-09 07:00:00", testTimePointFrmt);
  const subPers = [new StatePeriod(subPerStart, subPerEnd, 'PARTIAL')];

  let pers = splitPeriod(okPer, subPers);
  //logPeriods(pers);

  if (pers.length !== 2) {
    throw "pers.length !== 2";
  }
  checkPeriod(pers[0], mainPerStart, subPerStart, 'OK', 1);
  checkPeriod(pers[1], subPerStart, mainPerEnd, 'PARTIAL', 2);
}

function test2MidSubPers() {
  log('test2MidSubPers');
  const mainPerStart = moment("2016-02-09 06:00:00", testTimePointFrmt);
  const mainPerEnd = moment("2016-02-09 07:00:00", testTimePointFrmt);
  const okPer = new StatePeriod(mainPerStart, mainPerEnd, 'OK');

  const subPer1Start = moment("2016-02-09 06:15:00", testTimePointFrmt);
  const subPer1End = moment("2016-02-09 06:25:00", testTimePointFrmt);
  const subPer2Start = moment("2016-02-09 06:35:00", testTimePointFrmt);
  const subPer2End = moment("2016-02-09 06:45:00", testTimePointFrmt);
  const subPers = [
    new StatePeriod(subPer1Start, subPer1End, 'PARTIAL'),
    new StatePeriod(subPer2Start, subPer2End, 'PARTIAL')
  ];

  let pers = splitPeriod(okPer, subPers);
  //logPeriods(pers);

  if (pers.length !== 5) {
    throw "pers.length !== 5";
  }
  checkPeriod(pers[0], mainPerStart, subPer1Start, 'OK', 1);
  checkPeriod(pers[1], subPer1Start, subPer1End, 'PARTIAL', 2);
  checkPeriod(pers[2], subPer1End, subPer2Start, 'OK', 3);
  checkPeriod(pers[3], subPer2Start, subPer2End, 'PARTIAL', 4);
  checkPeriod(pers[4], subPer2End, mainPerEnd, 'OK', 5);
}

function testFullOverlapSubPer() {
  log('testFullOverlapSubPer');
  const mainPerStart = moment("2016-02-09 06:00:00", testTimePointFrmt);
  const mainPerEnd = moment("2016-02-09 07:00:00", testTimePointFrmt);
  const okPer = new StatePeriod(mainPerStart, mainPerEnd, 'OK');

  const subPers = [
    new StatePeriod(mainPerStart, mainPerEnd, 'PARTIAL')
  ];

  let pers = splitPeriod(okPer, subPers);
  //logPeriods(pers);

  if (pers.length !== 1) {
    throw "pers.length !== 1";
  }
  checkPeriod(pers[0], mainPerStart, mainPerEnd, 'PARTIAL', 1);
}

function checkPeriod(period, start, stop, state, periodNum) {
  if (!period.start.isSame(start)) {
    throw `period ${periodNum}: incorrect start`;
  }
  if (!period.end.isSame(stop)) {
    throw `period ${periodNum}: incorrect end`;
  }
  if (period.state !== state) {
    throw `period ${periodNum}: incorrect state`;
  }
}


/////////////////////////////////////////////////////////////////////
// run all tests

function runBusWarnPerTests() {
// test find warn periods
  testNoOverlap();
  testWholeOverlap();
  testPerCombi();
  testPerCombi2();

// test splitPeriod
  testLeftSubPer();
  testMidSubPer();
  testRightSubPer();
  test2MidSubPers();
  testFullOverlapSubPer();
}
