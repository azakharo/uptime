'use strict';

var mod = angular.module('alertService', []);

mod.factory('alertService', function($rootScope, $timeout, $interval, $window) {
    var alertService = {};

    // create an array of alerts available globally
    $rootScope.alerts = [];

    alertService.add = function (type, msg) {
        var newAlert = {
            type: type,
            msg: msg,
            close: function () {
                alertService.closeAlert(this);
            }
        };
        $rootScope.alerts.push(newAlert);

        $timeout(function () {
            alertService.closeAlert(newAlert);
        }, 8000);
    };

    alertService.closeAlert = function(alert) {
        alertService.closeAlertByIndex($rootScope.alerts.indexOf(alert));
    };

    alertService.closeAlertByIndex = function(index) {
        $rootScope.alerts.splice(index, 1);
    };

    alertService.clear = function() {
        $rootScope.alerts = [];
    };

    return alertService;
});
