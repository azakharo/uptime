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
          //log("transport status data were updated");
          $scope.selectedBus = null;
        }
      );
    }

    $scope.$watch('timePeriod', function (newVal, oldVal, scope) {
      updateTransportStatus();
    });

    $scope.selectedBus = null;
    $scope.onAccordionItemClicked = function (bus) {
      if (!$scope.selectedBus) {
        $scope.selectedBus = bus;
      }
      else {
        if ($scope.selectedBus === bus) {
          // unselect
          //$scope.selectedBus = null;
        }
        else {
          $scope.selectedBus = bus;
        }
      }
    };

    function log(msg) {
      $log.debug(msg);
    }

  });
