'use strict';

angular.module('armUptimeApp')
  .controller('MainCtrl', function ($scope, $log, $state, Auth, transpStatus) {
    $scope.Auth = Auth;
    $scope.timePeriod = 'day';

    $scope.onSettingsBtnClick = function() {
      log("settings clicked");
    };

    $scope.onLogOutBtnClick = function() {
      $state.go('login');
      Auth.logout();
    };

    $scope.busInfos = [];

    function updateTransportStatus() {
      transpStatus.getTransportStatus(moment(), moment()).then(
        function (data) {
          $scope.busInfos = data;
        }
      );
    }

    $scope.$watch('timePeriod', function (newVal, oldVal, scope) {
      updateTransportStatus();
    });

    function log(msg) {
      $log.debug(msg);
    }

  });
