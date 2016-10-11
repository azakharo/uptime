'use strict';

var mod = angular.module('restServiceFake', []);

mod.service(
  "restFake",
  function ($q) {

    function getStatPassengersPerDay(dtStart, dtEnd) {
      var deffered = $q.defer();

      var data = [];
      var days = getDays(dtStart, dtEnd);

      days.forEach(function (day, dayIndex) {
        data.push({
          day: day,
          passengers: _.random(100),
          passCountErr: _.random(0, 15, true) / 100
        });
      });

      deffered.resolve(data);

      return deffered.promise;
    }

    function getStatBusesPerDay(dtStart, dtEnd) {
      var deffered = $q.defer();

      var data = [];
      var days = getDays(dtStart, dtEnd);

      days.forEach(function (day, dayIndex) {
        data.push({
          day: day,
          buses: _.random(10)
        });
      });

      deffered.resolve(data);

      return deffered.promise;
    }

    function getStatPassengersAvgPerHour(dtStart, dtEnd, numOfDays) {
      var deffered = $q.defer();
      var data = [];

      var hours = _.times(24, h => h);

      hours.forEach(function (hour) {
        var statItemInd = hour;
        data.push(_.random(100));
      });

      deffered.resolve(data);

      return deffered.promise;
    }

    function getStatPassKmPerDayPerOrg(dtStart, dtFinish) {
      var deffered = $q.defer();

      var orgs = _.times(3, ind => "Организация " + (ind + 1));

      var days = getDays(dtStart, dtFinish);

      var retVal = [];
      orgs.forEach(function (org) {
        var orgItem = {
          name: org
        };
        var passKms = [];
        days.forEach(function (day, dayIndex) {
          passKms.push({
            day: day,
            passKm: _.round(_.random(0, 1000, true), 3)
          });
        });
        orgItem.passKms = passKms;
        retVal.push(orgItem);
      });

      deffered.resolve(retVal);

      return deffered.promise;
    }

    // buses table
    function getPassengersInOut() {
      var deffered = $q.defer();

      var startDay = moment().startOf('day').add(8, 'hours').subtract(30, 'days');
      var data = _.times(30, function(ind) {
        var day = angular.copy(startDay);
        day.add(ind + 1, 'days');
        var inout = {};
        inout.timestamp = day;
        inout.busID = "c579kk";
        inout.input = 1;
        return inout;
      });
      var outData = _.times(30, function(ind) {
        var day = angular.copy(startDay);
        day.add(ind + 1, 'days').add(1, 'minutes');
        var inout = {};
        inout.timestamp = day;
        inout.busID = "c579kk";
        inout.output = 1;
        return inout;
      });

      // add 1 more item
      var inout = {};
      inout.timestamp = moment().startOf('day').subtract(1, 'days').add(9, 'hours');
      inout.busID = "c579kc";
      inout.input = 3;
      data.push(inout);

      data = data.concat(outData);
      // sort by timestamp desc
      data = _.sortBy(data, function (iO) {
        return -iO.timestamp;
      });
      deffered.resolve(data);

      return deffered.promise;
    }

    const VEHICLES = [
      {
        "description": "",
        "id": 1,
        "mac": "a0:f6:fd:4a:2f:d4",
        "meta": {},
        "owner": "ИТС Система Саров",
        "terminal_id": "DC435KM",
        "title": "DC435KM",
        "updatedAt": 1468921419
      },
      {
        "description": "",
        "id": 2,
        "mac": "",
        "meta": null,
        "owner": "МП г.о.Саранск \"ГорЭлектроТранс\"",
        "terminal_id": "2117",
        "title": "2117",
        "updatedAt": 1450787338
      },
      {
        "description": "",
        "id": 3,
        "mac": "",
        "meta": null,
        "owner": "МП г.о.Саранск \"ГорЭлектроТранс\"",
        "terminal_id": "1093",
        "title": "1093",
        "updatedAt": 1450811076
      },
      {
        "description": "",
        "id": 4,
        "mac": "",
        "meta": null,
        "owner": "МП г.о.Саранск \"ГорЭлектроТранс\"",
        "terminal_id": "1022",
        "title": "1022",
        "updatedAt": 1450811089
      },
      {
        "description": "",
        "id": 5,
        "mac": "",
        "meta": null,
        "owner": "МП г.о.Саранск \"ГорЭлектроТранс\"",
        "terminal_id": "AM136",
        "title": "AM136",
        "updatedAt": 1450856050
      },
      {
        "description": "",
        "id": 6,
        "mac": "",
        "meta": null,
        "owner": "МП г.о.Саранск \"ГорЭлектроТранс\"",
        "terminal_id": "E873CH",
        "title": "E873CH",
        "updatedAt": 1450856084
      },
      {
        "description": "",
        "id": 8,
        "mac": "a0:f6:fd:17:b9:b4",
        "meta": {},
        "owner": "ИТЦ Система-Саров",
        "terminal_id": "a0f6fd17b9b4",
        "title": "DC111KM",
        "updatedAt": 1468935382
      },
      {
        "description": "",
        "id": 10002,
        "mac": "",
        "meta": {},
        "owner": "qqqq",
        "terminal_id": "test2",
        "title": "test1",
        "updatedAt": 1469105435
      },
      {
        "description": "",
        "id": 10003,
        "mac": "a0:f6:fd:17:ab:d3",
        "meta": {},
        "owner": "ИТЦ Система-Саров",
        "terminal_id": "a0f6fd17abd3",
        "title": "DC666KM",
        "updatedAt": 1469526335
      }
    ];

    function getVehicles() {
      var deffered = $q.defer();
      deffered.resolve(VEHICLES);
      return deffered.promise;
    }

    const TERMINALS = [
      {
        "detectorAmount": 3,
        "id": 1,
        "meta": null,
        "number": "AM136",
        "updatedAt": 1451416752,
        "validatorAmount": 3
      },
      {
        "detectorAmount": 3,
        "id": 2,
        "meta": null,
        "number": "E873CH",
        "updatedAt": 1451416797,
        "validatorAmount": 3
      },
      {
        "detectorAmount": 3,
        "id": 3,
        "meta": null,
        "number": "1022",
        "updatedAt": 1452628712,
        "validatorAmount": 3
      },
      {
        "detectorAmount": 0,
        "id": 4,
        "meta": null,
        "number": "1093",
        "updatedAt": 1464691566,
        "validatorAmount": 2
      },
      {
        "detectorAmount": 3,
        "id": 5,
        "meta": null,
        "number": "2117",
        "updatedAt": 1451416841,
        "validatorAmount": 2
      },
      {
        "detectorAmount": 0,
        "id": 7,
        "meta": null,
        "number": "4321",
        "updatedAt": 1464691995,
        "validatorAmount": 2
      },
      {
        "detectorAmount": 0,
        "id": 8,
        "meta": null,
        "number": "4322",
        "updatedAt": 1464692149,
        "validatorAmount": 1
      },
      {
        "detectorAmount": 0,
        "id": 10,
        "meta": null,
        "number": "DC579KK",
        "updatedAt": 1468920864,
        "validatorAmount": 1
      },
      {
        "detectorAmount": 0,
        "id": 11,
        "meta": null,
        "number": "a0f6fd17b9b4",
        "updatedAt": 1468935310,
        "validatorAmount": 3
      },
      {
        "detectorAmount": 0,
        "id": 10002,
        "meta": null,
        "number": "Test1",
        "updatedAt": 1469105385,
        "validatorAmount": 0
      },
      {
        "detectorAmount": 0,
        "id": 10003,
        "meta": null,
        "number": "test2",
        "updatedAt": 1469105416,
        "validatorAmount": 0
      },
      {
        "detectorAmount": 0,
        "id": 10004,
        "meta": null,
        "number": "a0f6fd17abd3",
        "updatedAt": 1469526254,
        "validatorAmount": 3
      }
    ];

    function getTerminals() {
      var deffered = $q.defer();
      deffered.resolve(TERMINALS);
      return deffered.promise;
    }

    const TRANSP_RAW_DATA = [
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12398,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476163012,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476163021,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65946,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476163021,
        "updatedAt": 1476163021
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12399,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476163323,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476163340,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65948,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476163340,
        "updatedAt": 1476163340
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12400,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476163641,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476163654,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65950,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476163654,
        "updatedAt": 1476163654
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12401,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476163955,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476163976,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65951,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476163976,
        "updatedAt": 1476163976
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12402,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476164277,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476164291,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65952,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476164291,
        "updatedAt": 1476164291
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12403,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476164592,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476164608,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65954,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476164608,
        "updatedAt": 1476164608
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12404,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476164909,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476164927,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65955,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476164927,
        "updatedAt": 1476164927
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12405,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476165228,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476165243,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65956,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476165243,
        "updatedAt": 1476165243
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12406,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476165545,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476165561,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65958,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476165561,
        "updatedAt": 1476165561
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12407,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476165862,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476165876,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65960,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476165876,
        "updatedAt": 1476165876
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12408,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476166176,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476166191,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65962,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476166191,
        "updatedAt": 1476166191
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12409,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476166811,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476166820,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65965,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476166820,
        "updatedAt": 1476166820
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12410,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476167120,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476167137,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65967,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476167137,
        "updatedAt": 1476167137
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12411,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476167438,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476167452,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65969,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476167452,
        "updatedAt": 1476167452
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12412,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476167753,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476167771,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65971,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476167771,
        "updatedAt": 1476167771
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12413,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476168072,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476168082,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65972,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476168082,
        "updatedAt": 1476168082
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12414,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476168383,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476168400,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65973,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476168400,
        "updatedAt": 1476168400
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12415,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476168701,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476168717,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65974,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476168717,
        "updatedAt": 1476168717
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12416,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476169018,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476169033,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65975,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476169033,
        "updatedAt": 1476169033
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12417,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476169333,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476169349,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65977,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476169349,
        "updatedAt": 1476169349
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12418,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476169650,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476169686,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65979,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476169686,
        "updatedAt": 1476169686
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12419,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476169987,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476170003,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65980,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476170003,
        "updatedAt": 1476170003
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12420,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476170304,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476170319,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65981,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476170319,
        "updatedAt": 1476170319
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12421,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476170619,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476170633,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65982,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476170633,
        "updatedAt": 1476170633
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12422,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476171600,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476171618,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65986,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476171618,
        "updatedAt": 1476171618
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12423,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476171920,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476171934,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65988,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476171934,
        "updatedAt": 1476171934
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12424,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476172235,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476172250,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65990,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476172250,
        "updatedAt": 1476172250
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12425,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476172550,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476172570,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65992,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476172570,
        "updatedAt": 1476172570
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12426,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476172871,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476172885,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65994,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476172885,
        "updatedAt": 1476172885
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12427,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476173185,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476173198,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65996,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476173198,
        "updatedAt": 1476173198
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12428,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476173500,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476173517,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65998,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476173517,
        "updatedAt": 1476173517
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12429,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476173818,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476173830,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 65999,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476173830,
        "updatedAt": 1476173830
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12430,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476174131,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476174145,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 66001,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476174145,
        "updatedAt": 1476174145
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12431,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476174446,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476174468,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 66003,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476174468,
        "updatedAt": 1476174468
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12432,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476174768,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476174780,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 66005,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476174780,
        "updatedAt": 1476174780
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12433,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476175080,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476175090,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 66006,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476175090,
        "updatedAt": 1476175090
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12434,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476175391,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476175406,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 66007,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476175406,
        "updatedAt": 1476175406
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12435,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476175706,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476175726,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 66009,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476175726,
        "updatedAt": 1476175726
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12436,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476176026,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476176042,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 66011,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476176042,
        "updatedAt": 1476176042
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12437,
            "ip": "10.115.205.167",
            "stoplist": 7,
            "timestamp": 1476176343,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476176352,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 66012,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476176352,
        "updatedAt": 1476176352
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12438,
            "ip": "10.226.96.239",
            "stoplist": 7,
            "timestamp": 1476183631,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476183646,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 66025,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476183646,
        "updatedAt": 1476183646
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12439,
            "ip": "10.226.96.239",
            "stoplist": 7,
            "timestamp": 1476183947,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476183957,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 66027,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476183957,
        "updatedAt": 1476183957
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12440,
            "ip": "10.226.96.239",
            "stoplist": 7,
            "timestamp": 1476184258,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476184274,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 66029,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476184274,
        "updatedAt": 1476184274
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12441,
            "ip": "10.226.96.239",
            "stoplist": 7,
            "timestamp": 1476184575,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476184589,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 66031,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476184589,
        "updatedAt": 1476184589
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12442,
            "ip": "10.226.96.239",
            "stoplist": 7,
            "timestamp": 1476184890,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476184902,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 66034,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476184902,
        "updatedAt": 1476184902
      },
      {
        "eventInfo": {
          "message": "created",
          "meta": {
            "gps": {
              "active": true,
              "speed": 0
            },
            "id": 12443,
            "ip": "10.226.96.239",
            "stoplist": 7,
            "timestamp": 1476185203,
            "traffic": {},
            "uhf": {},
            "updatedAt": 1476185213,
            "validator": {
              "00:1a:b6:02:00:57": 0
            },
            "vehicleId": 1
          }
        },
        "eventType": "logInfo",
        "id": 66037,
        "serviceName": "pt-statusregistry",
        "timestamp": 1476185213,
        "updatedAt": 1476185213
      }
    ];

    function getTranspStatusRawData(dtStart, dtEnd) {
      var deffered = $q.defer();
      deffered.resolve(TRANSP_RAW_DATA);
      return deffered.promise;
    }

    // Return public API
    return {
      getStatPassengersPerDay:      getStatPassengersPerDay,
      getStatBusesPerDay:           getStatBusesPerDay,
      getStatPassengersAvgPerHour:  getStatPassengersAvgPerHour,
      getStatPassKmPerDayPerOrg:    getStatPassKmPerDayPerOrg,
      getPassengersInOut:           getPassengersInOut,
      getVehicles:                  getVehicles,
      getTerminals:                 getTerminals,
      getTranspStatusRawData:       getTranspStatusRawData
    };

  });
