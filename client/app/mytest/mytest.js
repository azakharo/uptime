'use strict';

angular.module('armUptimeApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('mytest', {
        url: '/mytest',
        templateUrl: 'app/mytest/mytest.html',
        controller: 'MytestCtrl'
      });
  });