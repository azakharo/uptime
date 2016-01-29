'use strict';

angular.module('armUptimeApp')
  .controller('MainCtrl', function ($scope, $log, $state, uiGridConstants, Auth, transpStatus) {
    $scope.Auth = Auth;
    $scope.timePeriod = 'hour';

    $scope.onSettingsBtnClick = function () {
      log("settings clicked");
    };

    $scope.onLogOutBtnClick = function () {
      $state.go('login');
      Auth.logout();
    };

    $scope.busInfos = [];
    $scope.intervals = {};

    function updateTransportStatus() {
      transpStatus.getBusDefines($scope.dtStart, $scope.dtEnd).then(
        function (data) {
          $scope.busInfos = data;
          $scope.intervals = createTimelineIntervals(data);
          log("transport statuses updated");
          //data.forEach(function (bus) {
          //  log(`bus '${bus.busName}'`);
          //  logPeriods(bus.periods);
          //  log("----------------------")
          //});
        }
      );
    }

    function createTimelineIntervals(busDefines) {
      let intervals = {};
      busDefines.forEach(function (bus) {
        intervals[bus.busName] = {};
        let intervl = intervals[bus.busName];

        // Bus intervals
        intervl.busIntervals = periods2TimelineIntervals(bus.periods);

        // Create intervals for every pp
        intervl.ppIntervals = {};
        bus.pp.forEach(function (name) {
          intervl.ppIntervals[name] = periods2TimelineIntervals(bus.ppPeriods[name]);
        });

        // Create status for every validator
        intervl.validatorIntervals = {};
        bus.validators.forEach(function (name) {
          intervl.validatorIntervals[name] = periods2TimelineIntervals(bus.validatorPeriods[name]);
        });
      });
      return intervals;
    }

    function periods2TimelineIntervals(periods) {
      return _.map(periods, function (per) {
        let color = undefined;
        if (per instanceof OnlinePeriod) {
          color = 'success';
        }
        else if (per instanceof OfflinePeriod) {
          color = 'danger';
        }

        return {
          dtStart: per.start,
          dtEnd: per.end,
          color: color
        };
      })
    }

    $scope.$watch('timePeriod', function (newVal, oldVal, scope) {
      // Clear data
      $scope.busInfos = [];
      $scope.gridOptions.data = [];
      $scope.selectedBus = null;

      const {start, end} = timePeriod2moments($scope.timePeriod);
      $scope.dtStart = start;
      $scope.dtEnd = end;

      updateTransportStatus();
      updateTransportEvents();
    });

    $scope.selectedBus = null;
    $scope.onAccordionItemClicked = function (bus) {
      if (!$scope.selectedBus) {
        $scope.selectedBus = bus;
        updateTransportEvents();
      }
      else {
        if ($scope.selectedBus === bus) {
          // unselect
          //$scope.selectedBus = null;
        }
        else {
          $scope.selectedBus = bus;
          updateTransportEvents();
        }
      }
    };

    $scope.getStatusBgClass = function (status) {
      let class2ret = null;
      switch (status) {
        case 'OK':
          class2ret = 'status-ok-bg';
          break;
        case 'FAIL':
          class2ret = 'status-failed-bg';
          break;
        case 'PARTIAL':
          class2ret = 'status-partial-bg';
          break;
        default:
          class2ret = 'status-unknown-bg';
          break;
      }
      return class2ret;
    };

    $scope.getStatusFgClass = function (status) {
      let class2ret = null;
      switch (status) {
        case 'OK':
          class2ret = 'status-ok-fg';
          break;
        case 'FAIL':
          class2ret = 'status-failed-fg';
          break;
        case 'PARTIAL':
          class2ret = 'status-partial-fg';
          break;
        default:
          class2ret = 'status-unknown-fg';
          break;
      }
      return class2ret;
    };


    //-----------------------------------
    // ui-grid setup

    $scope.gridOptions = {};

    $scope.gridOptions.columnDefs = [
      {
        displayName: 'Время',
        field: 'timestamp.toDate()',
        type: 'date',
        cellFilter: 'date: "yyyy-MM.dd HH:mm:ss"'
      },
      {
        displayName: 'Событие',
        field: 'name',
        cellFilter: 'transEventNameFilter'
      },
      {
        displayName: 'Детали',
        field: 'bus'
      },
      {
        displayName: 'Продолжительность',
        field: 'duration',
        cellClass: "text-right",
        headerCellClass: "text-right"
      }
    ];

    $scope.gridOptions.enableHorizontalScrollbar = uiGridConstants.scrollbars.NEVER;
    $scope.gridOptions.enableVerticalScrollbar = uiGridConstants.scrollbars.WHEN_NEEDED;
    $scope.gridOptions.enableColumnMenus = false;
    $scope.gridOptions.paginationPageSizes = [50, 100, 200, 250, 500];

    function updateTransportEvents() {
      //if (!$scope.selectedBus) {
      //  $scope.gridOptions.data = [];
      //  return;
      //}
      //let {start, end} = timePeriod2moments($scope.timePeriod);
      //transpStatus.getEvents($scope.selectedBus, start, end).then(
      //  function (events) {
      //    $scope.gridOptions.data = events;
      //    log("transport events updated");
      //  }
      //);
    }

    // ui-grid setup
    //-----------------------------------

    function timePeriod2moments(timePeriod) {
      let start = null;
      let end = moment();
      switch (timePeriod) {
        case 'hour':
          start = moment().subtract(1, 'hours');
          break;
        case 'day':
          start = moment().subtract(1, 'days');
          break;
        case 'week':
          start = moment().subtract(7, 'days');
          break;
        case 'month':
          start = moment().subtract(1, 'month');
          break;
        default:
          throw `UNEXPECTED time period '${timePeriod}'`;
      }
      return {
        start: start,
        end: end
      }
    }

    // Handle window resizing
    var onWindowResize = debounce(function () {
      // Make the right part same height as the left part
      // WORKAROUND the auto-resize issue when make window smaller
      $('#right-part').height($('#left-part').height());
    }, 1000);
    $(window).resize(onWindowResize);

    function log(msg) {
      $log.debug(msg);
    }

  })

  .filter('ppNameFilter', function () {
    return function (name) {
      let found = name.match(/^udp:\/\/(.*)#1$/i);
      if (found) {
        return found[1];
      }
      else {
        return name;
      }
    };
  })

  .filter('transEventNameFilter', function () {
    return function (eventType) {
      switch (eventType) {
        case 'validator_OK':
          return "валидатор появился";
        case 'validator_FAIL':
          return "валидатор пропал";
        case 'pp_OK':
          return "датчик пассажиропотока появился";
        case 'pp_FAIL':
          return "датчик пассажиропотока пропал";
        case 'uhf_OK':
          return "UHF появился";
        case 'uhf_FAIL':
          return "UHF пропал";
        default:
          return "неизвестное";
      }
    };
  });
