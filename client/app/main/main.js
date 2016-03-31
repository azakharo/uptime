'use strict';

angular.module('armUptimeApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      })
      .state('login', {
        url: '/login',
        template: '<login-dlg title="Uptime Monitor" success-route="main" success-route-debug="main" />',
        controller: function() {}
      });
  });
