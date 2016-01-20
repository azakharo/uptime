'use strict';

angular.module('authService', ['restService'])
  .factory('Auth', function($cookieStore, $q, myRest, $log) {
    // if update the keys, then update the app.js
    var KEY_TOKEN = 'token';
    var KEY_USERNAME = 'username';

    function logout() {
      log('logout');
      $cookieStore.remove(KEY_TOKEN);
      $cookieStore.remove(KEY_USERNAME);
    }

    function log(msg) {
      $log.debug(msg);
    }

    return {

      login: function (username, password) {
        var deferred = $q.defer();

        myRest.login(username, password)
          .then(
          function (data) {
            $cookieStore.put(KEY_TOKEN, data);
            $cookieStore.put(KEY_USERNAME, username);
            deferred.resolve(username);
          },
          function (err) {
            logout();
            deferred.reject(err);
          }
        );

        return deferred.promise;
      },

      logout: logout,

      getCurrentUser: function () {
        return $cookieStore.get(KEY_USERNAME);
      },

      isLoggedIn: function () {
        return $cookieStore.get(KEY_TOKEN) !== undefined;
      }

    };
  });
