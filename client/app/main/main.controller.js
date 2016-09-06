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
      //{
      //  url: myRest.getAcceptant1Url(),
      //  name: 'АРМ Акцептанта 1'
      //},
      {
        url: myRest.getAcceptant2Url(),
        name: 'Акцептант'
      },
      {
        url: myRest.getDashboardUrl(),
        name: 'Дашборд'
      },
      {
        url: myRest.getCtrlPanelUrl(),
        name: 'Контрольная панель'
      }
    ];

    function log(msg) {
      $log.debug(msg);
    }

  });
