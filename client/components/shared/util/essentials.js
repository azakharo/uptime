'use strict';

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}


///////////////////////////////////////////////////////////
// Log utils

function log(msg) {
  console.log(msg);
}
function logData(data) {
  log(JSON.stringify(data, null, 2));
}

// Log utils
///////////////////////////////////////////////////////////


function getBrowserInfo(){
  var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if(/trident/i.test(M[1])){
    tem=/\brv[ :]+(\d+)/g.exec(ua) || [];
    return {name:'IE ',version:(tem[1]||'')};
  }
  if(M[1]==='Chrome'){
    tem=ua.match(/\bOPR\/(\d+)/)
    if(tem!=null)   {return {name:'Opera', version:tem[1]};}
  }
  M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
  if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
  return {
    name: M[0],
    version: M[1]
  };
}


///////////////////////////////////////////////////////////
// Time utils

function getDays(dateStart, dateEnd) {
  return getTimeUnits(dateStart, dateEnd, 'days');
}

function getMonths(dateStart, dateEnd) {
  return getTimeUnits(dateStart, dateEnd, 'months');
}

function getYears(dateStart, dateEnd) {
  return getTimeUnits(dateStart, dateEnd, 'years');
}

function getTimeUnits(dateStart, dateEnd, unitsName) {
  var units = [];
  var u = dateStart.clone();
  while (u.isBefore(dateEnd) || u.isSame(dateEnd)) {
    units.push(u);
    u = u.clone();
    u.add(1, unitsName);
  }
  return units;
}

function isToday(momnt) {
  return momnt.isSame(moment(), 'day');
}

// Time utils
///////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////
// Number utils

function isInt(value) {
  return !isNaN(value) &&
    parseInt(Number(value)) == value &&
    !isNaN(parseInt(value, 10));
}

function isNumber(obj) { return !isNaN(parseFloat(obj)) }

// Number utils
///////////////////////////////////////////////////////////

function isTouchDevice() {
  return ('ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);
}
