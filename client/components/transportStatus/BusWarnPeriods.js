"use strict";

function findWarnPeriods(okPer, failPers) {
  // if there are no any fail periods, then ret empty arr
  if (!failPers || failPers.length === 0) {
    return [];
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
        retval = [new StatePeriod(okPer.start, okPer.end, 'PARTIAL')]
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

}
