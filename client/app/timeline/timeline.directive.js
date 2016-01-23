'use strict';

angular.module('armUptimeApp')
  .directive('timeline', function () {
    return {
      templateUrl: 'app/timeline/timeline.html',
      restrict: 'EA',
      scope: {
        dtStart: '=',
        dtEnd: '=',
        intervals: '='
      },

      controller: ['$scope', '$log', function ($scope, $log) {
        let totalDurationInSec = $scope.dtEnd.unix() - $scope.dtStart.unix();
        $scope.timeIntervals = _.map($scope.intervals, function (intervl) {
          let timeIntervl = {
            dtStart: intervl.dtStart,
            dtEnd: intervl.dtEnd,
            color: intervl.color
          };
          // Find the percent
          timeIntervl.percent = (timeIntervl.dtEnd.unix() - timeIntervl.dtStart.unix()) / totalDurationInSec * 100;
          return timeIntervl;
        });
      }]

    }; // return
  });
