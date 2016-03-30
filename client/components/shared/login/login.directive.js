'use strict';

angular.module('loginDlg')
  .directive('loginDlg', function () {
    return {
      scope: {
        title: '@',
        successRoute: '@',
        successRouteDebug: '@'
      },
      controller: 'LoginDlgCtrl',
      templateUrl: 'components/shared/login/login.html'
    };
  });
