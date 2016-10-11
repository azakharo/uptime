'use strict';

var mod = angular.module('restServiceFake', []);

mod.service(
  "restFake",
  function ($q) {

    function getStatPassengersPerDay(dtStart, dtEnd) {
      var deffered = $q.defer();

      var data = [];
      var days = getDays(dtStart, dtEnd);

      days.forEach(function (day, dayIndex) {
        data.push({
          day: day,
          passengers: _.random(100),
          passCountErr: _.random(0, 15, true) / 100
        });
      });

      deffered.resolve(data);

      return deffered.promise;
    }

    function getStatBusesPerDay(dtStart, dtEnd) {
      var deffered = $q.defer();

      var data = [];
      var days = getDays(dtStart, dtEnd);

      days.forEach(function (day, dayIndex) {
        data.push({
          day: day,
          buses: _.random(10)
        });
      });

      deffered.resolve(data);

      return deffered.promise;
    }

    function getStatPassengersAvgPerHour(dtStart, dtEnd, numOfDays) {
      var deffered = $q.defer();
      var data = [];

      var hours = _.times(24, h => h);

      hours.forEach(function (hour) {
        var statItemInd = hour;
        data.push(_.random(100));
      });

      deffered.resolve(data);

      return deffered.promise;
    }

    function getStatPassKmPerDayPerOrg(dtStart, dtFinish) {
      var deffered = $q.defer();

      var orgs = _.times(3, ind => "Организация " + (ind + 1));

      var days = getDays(dtStart, dtFinish);

      var retVal = [];
      orgs.forEach(function (org) {
        var orgItem = {
          name: org
        };
        var passKms = [];
        days.forEach(function (day, dayIndex) {
          passKms.push({
            day: day,
            passKm: _.round(_.random(0, 1000, true), 3)
          });
        });
        orgItem.passKms = passKms;
        retVal.push(orgItem);
      });

      deffered.resolve(retVal);

      return deffered.promise;
    }

    // buses table
    function getPassengersInOut() {
      var deffered = $q.defer();

      var startDay = moment().startOf('day').add(8, 'hours').subtract(30, 'days');
      var data = _.times(30, function(ind) {
        var day = angular.copy(startDay);
        day.add(ind + 1, 'days');
        var inout = {};
        inout.timestamp = day;
        inout.busID = "c579kk";
        inout.input = 1;
        return inout;
      });
      var outData = _.times(30, function(ind) {
        var day = angular.copy(startDay);
        day.add(ind + 1, 'days').add(1, 'minutes');
        var inout = {};
        inout.timestamp = day;
        inout.busID = "c579kk";
        inout.output = 1;
        return inout;
      });

      // add 1 more item
      var inout = {};
      inout.timestamp = moment().startOf('day').subtract(1, 'days').add(9, 'hours');
      inout.busID = "c579kc";
      inout.input = 3;
      data.push(inout);

      data = data.concat(outData);
      // sort by timestamp desc
      data = _.sortBy(data, function (iO) {
        return -iO.timestamp;
      });
      deffered.resolve(data);

      return deffered.promise;
    }

    // Return public API
    return {
      getStatPassengersPerDay:      getStatPassengersPerDay,
      getStatBusesPerDay:           getStatBusesPerDay,
      getStatPassengersAvgPerHour:  getStatPassengersAvgPerHour,
      getStatPassKmPerDayPerOrg:    getStatPassKmPerDayPerOrg,
      getPassengersInOut:           getPassengersInOut
    };

  });
