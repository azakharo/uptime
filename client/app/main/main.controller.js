'use strict';

angular.module('armUptimeApp')
  .controller('MainCtrl', function ($scope, $log, $state, Auth) {
    $scope.Auth = Auth;
    $scope.timePeriod = 'day';

    $scope.onSettingsBtnClick = function() {
      log("settings clicked");
    };

    $scope.onLogOutBtnClick = function() {
      $state.go('login');
      Auth.logout();
    };

    function log(msg) {
      $log.debug(msg);
    }

  });
