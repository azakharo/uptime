'use strict';

angular.module('armUptimeApp', [
  'ngCookies',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'restService',
  'authService'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  });
