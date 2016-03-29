"use strict";

function findWarnPeriods(okPer, failPers) {
  // if there are no any fail periods, then ret empty arr
  if (!failPers || failPers.length === 0) {
    return [];
  }

  // Remove non uniq fail pers
  failPers = _.uniqWith(failPers, function (per1, per2) {
    return per1.isSame(per2);
  });

  // Remove periods which are contained by other periods
  // Find the periods
  let includedPers = [];
  _.forEach(failPers, function (examinedPer) {
    _.forEach(failPers, function (per) {
      if (!per.isSame(examinedPer) && per.contains(examinedPer)) {
        includedPers.push(examinedPer);
        return false;
      }
    });
  });
  // Rem the periods
  if (includedPers.length > 0) {
    failPers = _.filter(failPers, function (per) {
      let need2rem = false;
      _.forEach(includedPers, function (inclPer) {
        if (inclPer.isSame(per)) {
          need2rem = true;
          return false;
        }
      });
      return !need2rem;
    });
  }

  // Sort all fail periods by start asc
  failPers = _.sortBy(failPers, function (fp) {
    return fp.start.unix();
  });

  // For every fail per try find intersection with the ok per
  let intersections = [];
  let retval = null;
  _.forEach(failPers, function (fp) {
    let intsect = okPer.intersect(fp);
    if (intsect) { // if there is an intersection
      // If the intersection contains whole ok per, then ret 1 warn per equal to ok per
      if (intsect.isSame(okPer)) {
        retval = [new StatePeriod(okPer.start, okPer.end, 'PARTIAL')];
        return false;
      }

      intersections.push(intsect);
    }
  });
  if (retval) {
    return retval;
  }
  if (intersections.length === 0) {
    return [];
  }

  // If intersections have been found (> 1), then try to union the found intersections
  let combinedIntersects = [];
  if (intersections.length > 1) {
    let i = 0;
    let j;

    while (i <= intersections.length - 1) {
      let curPer = intersections[i];

      // Try to join with every next per
      j = i + 1;
      while (j < intersections.length - 1) {
        if (curPer.intersect(intersections[j])) { // if intersection
          // Union the periods
          curPer = curPer.add(intersections[j]);
          i = j;
        }
        j += 1;
      }

      // If the combined intersect contains whole ok per, then ret 1 warn per equal to ok per
      if (curPer.isSame(okPer)) {
        return [new StatePeriod(okPer.start, okPer.end, 'PARTIAL')];
      }

      combinedIntersects.push(curPer);
      i += 1;
    }
  }
  else {
    combinedIntersects = intersections;
  }

  // Transform final intersections to array of state periods
  return _.map(combinedIntersects, function(intsect) {
    return new StatePeriod(intsect.start, intsect.end, 'PARTIAL');
  })
}

function splitPeriod(mainPer, subPers) {
  if (!subPers || subPers.length === 0) {
    return [mainPer];
  }
  let pers2ret = [];
  let curPos = mainPer.start;

  let need2ret = false;
  _.forEach(subPers, function (subPer) {
    // is same as the main per
    if (subPer.isSame(mainPer)) {
      pers2ret = [subPer];
      need2ret = true;
      return false;
    }
    // if starts together with the main per
    if (subPer.start.isSame(mainPer.start)) {
      pers2ret.push(subPer);
    }
    else {
      let mainPerSubRange = new Period(curPos, subPer.end);
      let [okSubRange] = mainPerSubRange.subtract(subPer);
      pers2ret.push(new StatePeriod(okSubRange.start, okSubRange.end, 'OK'));
      pers2ret.push(subPer);
    }

    curPos = subPer.end;
  });

  // Add the range after all sub pers
  if (!need2ret && curPos.isBefore(mainPer.end)) {
    pers2ret.push(new StatePeriod(curPos, mainPer.end, 'OK'));
  }

  return pers2ret;
}
