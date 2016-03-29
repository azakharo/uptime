'use strict';

angular.module('uptime', [
  'TransportStatus',
  'ui.grid', 'ui.grid.autoResize', 'ui.grid.pagination',
  'ui.bootstrap',
  'angularSpinner'])
  .controller('UptimeCtrl', function ($scope, $log, $state, $q, $timeout, uiGridConstants, transpStatus) {
    $scope.isGettingData = false;

    let prevSelectedBusName = null;
    $scope.accordionItemOpenStates = {};
    let prevOpenBusName = null;
    function updateData() {
      // Remember previously selected and(?) open bus
      if ($scope.selectedBus) {
        prevSelectedBusName = $scope.selectedBus.busName;
        prevOpenBusName = _.find(Object.getOwnPropertyNames($scope.accordionItemOpenStates), function (busName) {
          return $scope.accordionItemOpenStates[busName];
        });
      }
      else {
        prevSelectedBusName = null;
        prevOpenBusName = null;
      }

      clearData();
      updateTransportStatus().then(
        function () {
          $scope.busInfos.forEach(function (bus) {
            $scope.accordionItemOpenStates[bus.busName] = false;
          });

          if (prevSelectedBusName) {
            // Restore the selected bus
            $scope.selectedBus = _.find($scope.busInfos, ['busName', prevSelectedBusName]);
            if ($scope.selectedBus) {
              // Restore the open state
              if (prevOpenBusName) {
                $scope.accordionItemOpenStates[prevOpenBusName] = true;
              }
            }
          }

          updateTransportEvents();
        }
      );
    }

    // Auto-update
    //var stopAutoRefresh = $interval(function () {
    //  buildTimelines();
    //}, 180000);
    //$scope.$on('$destroy', function () {
    //  $interval.cancel(stopAutoRefresh);
    //});

    // Manual update
    $scope.onRefreshBtnClick = function () {
      buildTimelines();
    };

    $scope.busInfos = [];
    $scope.intervals = {};

    function updateTransportStatus() {
      let deferred = $q.defer();

      $scope.isGettingData = true;
      transpStatus.getBusDefines($scope.dtStart, $scope.dtEnd).then(
        function (data) {
          $scope.busInfos = data;
          $scope.intervals = createTimelineIntervals(data);
          log("transport statuses updated");
          $scope.isGettingData = false;
          deferred.resolve();
        },
        function (reason) {
          $scope.isGettingData = false;
          deferred.resolve();
        }
      );

      return deferred.promise;
    }

    function createTimelineIntervals(busDefines) {
      let intervals = {};
      busDefines.forEach(function (bus) {
        intervals[bus.busName] = {};
        let intervl = intervals[bus.busName];

        // Bus intervals
        intervl.busIntervals = busPeriods2TimelineIntervals(bus.periods);

        // Create intervals for every pp
        intervl.ppIntervals = {};
        bus.pp.forEach(function (name) {
          intervl.ppIntervals[name] = ppValidatorPeriods2TimelineIntervals(bus.ppPeriods[name]);
        });

        // Create intervals for every validator
        intervl.validatorIntervals = {};
        bus.validators.forEach(function (name) {
          intervl.validatorIntervals[name] = ppValidatorPeriods2TimelineIntervals(bus.validatorPeriods[name]);
        });

        // Create GPS state intervals
        intervl.gpsIntervals = gpsPeriods2TimelineIntervals(bus.gpsPeriods);
      });
      return intervals;
    }

    function busPeriods2TimelineIntervals(periods) {
      return _.map(periods, function (per) {
        let color = undefined;
        let status;
        if (per.state === 'OK') {
          color = 'success';
          status = 'OK';
        }
        else if (per.state === 'PARTIAL') {
          color = 'warning';
          status = 'есть проблемы';
        }
        else if (per.state === 'UNAVAIL') {
          color = 'info';
          status = 'нет связи';
        }

        return {
          dtStart: per.start,
          dtEnd: per.end,
          color: color,
          status: status
        };
      })
    }

    function ppValidatorPeriods2TimelineIntervals(periods) {
      return _.map(periods, function (per) {
        let color = undefined;
        let status;
        if (per.state === 'OK') {
          color = 'success';
          status = 'OK';
        }
        else if (per.state === 'FAIL') {
          color = 'danger';
          status = 'отказ';
        }
        else if (per.state === 'UNAVAIL') {
          color = 'info';
          status = 'нет связи';
        }

        return {
          dtStart: per.start,
          dtEnd: per.end,
          color: color,
          status: status
        };
      })
    }

    function gpsPeriods2TimelineIntervals(periods) {
      return _.map(periods, function (per) {
        let color = undefined;
        let status;
        if (per.state === 'OK') {
          color = 'success';
          status = 'OK';
        }
        else if (per.state === 'FAIL') {
          color = 'danger';
          status = 'отказ';
        }
        else if (per.state === 'NO_SATELLITE') {
          color = 'warning';
          status = 'нет спутников';
        }
        else if (per.state === 'UNAVAIL') {
          color = 'info';
          status = 'нет связи';
        }

        return {
          dtStart: per.start,
          dtEnd: per.end,
          color: color,
          status: status
        };
      })
    }

    function clearData() {
      $scope.gridOptions.data = [];
      $scope.selectedBus = null;
      $scope.intervals = {};
      $scope.busInfos = [];
    }

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
        case 'NO_SATELLITE':
          class2ret = 'status-partial-bg';
          break;
        case 'UNAVAIL':
          class2ret = 'status-unavail-bg';
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
        case 'NO_SATELLITE':
          class2ret = 'status-partial-fg';
          break;
        case 'UNAVAIL':
          class2ret = 'status-unavail-fg';
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
        cellFilter: 'date: "HH:mm:ss"',
        width: '*'
      },
      {
        displayName: 'Событие',
        field: 'getTypeName()',
        width: '**'
      },
      {
        displayName: 'Компонент',
        field: 'getComponentName()',
        width: '**'
      },
      {
        displayName: 'Длительность',
        field: 'getDuration()',
        cellClass: "text-right",
        headerCellClass: "text-right",
        width: '*'
      }
    ];

    $scope.gridOptions.enableHorizontalScrollbar = uiGridConstants.scrollbars.NEVER;
    $scope.gridOptions.enableVerticalScrollbar = uiGridConstants.scrollbars.WHEN_NEEDED;
    $scope.gridOptions.enableColumnMenus = false;
    $scope.gridOptions.paginationPageSizes = [50, 100, 200, 250, 500];

    function updateTransportEvents() {
      if (!$scope.busInfos || !$scope.selectedBus) {
        $scope.gridOptions.data = [];
        return;
      }
      $scope.gridOptions.data = transpStatus.createEvents(
        $scope.selectedBus, $scope.busInfos, $scope.dtStart, $scope.dtEnd);
      log("transport events updated");
    }

    // ui-grid setup
    //-----------------------------------


    //===================================
    // Date picker

    $scope.dt = moment().toDate();
    $scope.today = moment().toDate();

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1,
      showWeeks: false
    };

    $scope.dateFormat = 'dd.MM.yyyy';
    $scope.altInputFormats = ['d!.M!.yyyy'];

    $scope.$watch('dt', function (newVal, oldVal, scope) {
      buildTimelines();
    });

    // Date picker
    //===================================

    function buildTimelines() {
      $scope.isGettingData = true;
      $timeout(
        function () {
          var dt = moment($scope.dt);
          $scope.dtStart = moment($scope.dt).startOf('day');
          $scope.dtEnd = isToday(dt) ? moment() : dt.endOf('day');

          updateData();
        },
        100);
    }

    // Handle window resizing
    var onWindowResize = debounce(function () {
      var leftPart = $('#uptime-left-part');
      var rightPart = $('#uptime-right-part');

      if (window.innerWidth <= 800) { // small screens
        var partW = window.innerWidth - 40;
        rightPart.width(partW);
        leftPart.width(partW);

        $('#bus-events').height(400);
      }
      else { // big screens
        var browser = getBrowserInfo();
        if (browser.name === 'Firefox') {
          $state.reload();
          return;
        }

        var partW = Math.floor(window.innerWidth / 2);
        rightPart.width(partW);
        leftPart.width(partW);

        // Make the right part same height as the left part
        // WORKAROUND the auto-resize issue when make window smaller
        rightPart.height(leftPart.height());
      }
    }, 2000);
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
  });
