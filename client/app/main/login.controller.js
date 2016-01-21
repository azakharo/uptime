'use strict';

var mod = angular.module('armUptimeApp');

mod.controller('loginCtrl', function ($scope, $rootScope, Auth, $state) {
  $scope.errors = {};
  $("#username-input").focus();

  $scope.login = function (form) {
    $scope.submitted = true;

    if (form.$valid) {
      Auth.login($scope.username, $scope.password)
        .then(function () {
          var state2route;
          if ($rootScope.state2routeAfterLogin) {
            state2route = $rootScope.state2routeAfterLogin;
            $rootScope.state2routeAfterLogin = undefined;
          }
          else {
            state2route = 'main';
          }
          $state.go(state2route);
        })
        .catch(function () {
          $scope.errors.other = 'Не удалось войти, повторите ввод данных.';
        });
    }
  };

});