'use strict';

angular.module('armUptimeApp')
  .controller('MainCtrl', function ($scope, $log, $state, Auth, myRest) {
    $scope.Auth = Auth;

    $scope.onSettingsBtnClick = function () {
      log("settings clicked");
    };

    $scope.onLogOutBtnClick = function () {
      $state.go('login');
      Auth.logout();
    };

    // Navi menu
    $scope.naviMenuItems = [
      {
        url: myRest.getAcceptantUrl(),
        name: 'АРМ Акцептанта'
      },
      {
        url: myRest.getDashboardUrl(),
        name: 'Дашборд'
      }
    ];

    function log(msg) {
      $log.debug(msg);
    }

  });
