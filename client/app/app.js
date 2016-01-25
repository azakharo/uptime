'use strict';

angular.module('armUptimeApp', [
  'ngCookies',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'ui.grid',
  'ui.grid.autoResize',
  'restService',
  'TransportStatus',
  'authService'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  })

  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location, $log) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers['Auth-Access-Token'] = $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if (response.status === 401 || response.status === 403) {
          $log.debug('intercepted ' + response.status);
          $location.path('/login');
          $cookieStore.remove('token');
          $cookieStore.remove('username');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .run(function ($rootScope, $state, Auth, $log) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      if (next.authenticate && !Auth.isLoggedIn()) {
        $log.debug('need auth, redirect to login');
        $rootScope.state2routeAfterLogin = next.name;
        event.preventDefault();
        $state.go('login');
      }
    });
  })

  // Additional configuration
  .run(function (i18nService, myRest) {
    // Cause 401 if necessary
    myRest.getApps();

    // moment js
    moment.locale('ru');

    // ui-grid
    i18nService.setCurrentLang('ru');
  });
