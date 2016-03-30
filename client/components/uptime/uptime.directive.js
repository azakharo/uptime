'use strict';

angular.module('uptime')
  .directive('uptime', function () {
    return {
      scope: {},
      controller: 'UptimeCtrl',
      templateUrl: 'components/uptime/uptime.html'
    };
  });
