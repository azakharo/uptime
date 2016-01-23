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

      controller: ['$scope', '$log', '$sce', function ($scope, $log) {
        // Prepare time intervals needed for the drawing
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

        // Tooltip html
        $scope.getTooltipHtml = function(intervl) {
          let timeFrmt = 'HH:mm:ss DD.MM.YYYY';
          let start = intervl.dtStart.format(timeFrmt);
          let end = intervl.dtEnd.format(timeFrmt);
          let duration = intervl.dtEnd.from(intervl.dtStart);
          return `<p>Начало: ${start}</p>
          <p>&nbsp;Конец: ${end}</p>
          <p>Продолжительность: ${duration}</p>`;
        };
      }]

    }; // return
  });
