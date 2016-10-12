'use strict';

var isRestDebug = true;

var mod = angular.module('restService', ['restServiceFake']);

mod.service(
  "myRest",
  function ($http, $q, $log, $rootScope, restFake) {

    var baseURL = '/api/cp/v1/';
    var turnoverBaseURL = '/api/pt/v1/';
    var personDataBaseURL = '/api/spd/v1/';
    var operArmBaseURL = '/api/operator/v1/';
    var loginUrl = '/api/auth/v1/login';
    var transpStatusUrl = '/api/protocolmessage/v1/protocolmessage';
    var acceptantUrl = '/acceptant';
    var uptimeUrl = '/uptime';
    var dashboardUrl = '/dashboard';
    var ctrlPanelUrl = '/public-dashboard';
    const acceptant1path = '/arm/accounting/stat-common-chart';
    const acceptant2path = '/acceptant2/statistic';
    var armBankaUrl = '/bank';
    let acceptant1Url = '';
    let acceptant2Url = '';
    //if (isRestDebug) {
    //  var serverAddr = 'https://mrd.sarov-itc.ru';
    //  baseURL = serverAddr + baseURL;
    //  turnoverBaseURL = serverAddr + turnoverBaseURL;
    //  personDataBaseURL = serverAddr + personDataBaseURL;
    //  operArmBaseURL = serverAddr + operArmBaseURL;
    //  loginUrl = serverAddr + loginUrl;
    //  transpStatusUrl = serverAddr + transpStatusUrl;
    //  acceptantUrl = serverAddr + acceptantUrl;
    //  uptimeUrl = serverAddr + uptimeUrl;
    //  dashboardUrl = serverAddr + dashboardUrl;
    //  ctrlPanelUrl = serverAddr + ctrlPanelUrl;
    //  armBankaUrl = serverAddr + armBankaUrl;
    //}
    acceptant1Url = acceptantUrl + '/#' + acceptant1path;
    acceptant2Url = acceptantUrl + '/#' + acceptant2path;

    function getBaseURL() {
      return baseURL;
    }

    function getAcceptantUrl() {
      return acceptantUrl;
    }

    function getUptimeUrl() {
      return uptimeUrl;
    }

    function getDashboardUrl() {
      return dashboardUrl;
    }

    function getAcceptant1Url() {
      return acceptant1Url;
    }

    function getAcceptant2Url() {
      return acceptant2Url;
    }

    function getCtrlPanelUrl() {
      return ctrlPanelUrl;
    }

    function getArmBankaUrl() {
      return armBankaUrl;
    }

    //$http.defaults.headers.common['Authorization'] = 'Basic ' + btoa('admin:admin');
    $http.defaults.headers.common['Content-type'] = 'application/json';

    //=====================================================
    // PUBLIC METHODS

    function getAccounts() {
      if (isRestDebug) {
        return restFake.getAccounts();
      }

      var request = $http({
        method: "get",
        url: baseURL + "accounts"
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getAccountInfo(accountSrvID) {
      var request = $http({
        method: "get",
        url: operArmBaseURL + "accounts/" + accountSrvID
      });
      return ( request.then(handleSuccess, handleError) );
    }


    function getAccountBags(accountID) {
      var request = $http({
        method: "get",
        url: baseURL + format('accounts/{}/bags', accountID)
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getAccountTransactions(accountID) {
      var request = $http({
        method: "get",
        url: baseURL + format('accounts/{}/transactions', accountID)
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getAccountMedias(accountID) {
      var request = $http({
        method: "get",
        url: baseURL + format('accounts/{}/medias', accountID)
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getApps() {
      var request = $http({
        method: "get",
        url: baseURL + "applications"
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getAppCurrencies(appID) {
      var request = $http({
        method: "get",
        url: baseURL + format('applications/{}/currencies', appID)
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getAppProviders(appID) {
      var request = $http({
        method: "get",
        url: baseURL + format('applications/{}/providers', appID)
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getAllProviders() {
      var providers = [];
      var deffered = $q.defer();

      getApps().then(
        function (apps) {
          var appInd = 0;
          apps.forEach(function (app) {
            getAppProviders(app.id).then(
              function (appProviders) {
                appProviders.forEach(function (prov) {
                  prov.app = app;
                });
                providers = providers.concat(appProviders);

                // if last app, then resolve
                if (appInd === apps.length - 1) {
                  deffered.resolve(providers);
                }

                appInd += 1;
              });
          });
        },
        function (reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getAllTransactions() {
      var transactions = [];
      var deffered = $q.defer();

      getAccounts().then(
        function (srvAccounts) {
          var accInd = 0;
          srvAccounts.forEach(function (srvAcc) {
            // Request transactions for the account
            getAccountTransactions(srvAcc.id).then(
              function (srvTransactions) {
                transactions = transactions.concat(srvTransactions);

                // if last account, then resolve
                if (accInd === srvAccounts.length - 1) {
                  // sort by timestamp desc
                  transactions = _.sortBy(transactions, function (trans) {
                    return -trans.timestamp;
                  });

                  //log('resolve');
                  deffered.resolve(transactions);
                }

                accInd += 1;
              });
          });
        },
        function (reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getOrgs() {
      var request = $http({
        method: "get",
        url: baseURL + 'providers'
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getVehicles() {
      if (isRestDebug) {
        return restFake.getVehicles();
      }

      var request = $http({
        method: "get",
        url: turnoverBaseURL + 'vehicles'
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getTerminals() {
      if (isRestDebug) {
        return restFake.getTerminals();
      }

      var request = $http({
        method: "get",
        url: turnoverBaseURL + 'terminals'
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getVehicleTurnover(vehicleID) {
      var request = $http({
        method: "get",
        url: turnoverBaseURL + format('vehicles/{}/turnovers', vehicleID)
      });
      return ( request.then(handleSuccess, handleError) );

      //// DUMMY DATA
      //var deffered = $q.defer();
      //
      //var startDay = moment().startOf('day').add(8, 'hours').subtract(30, 'days');
      //var data = _.times(30, function(ind) {
      //  var day = angular.copy(startDay);
      //  day.add(ind + 1, 'days');
      //
      //  if (ind !== 29) {
      //    var item = {
      //      "distance": 1700,
      //      "quantity": 2,
      //      "timeframe": {
      //        "finishTimestamp": day.unix()
      //      }
      //    };
      //  }
      //  else {
      //    var item = {
      //      "distance": 1500,
      //      "quantity": 2,
      //      "timeframe": {
      //        "finishTimestamp": day.unix()
      //      }
      //    };
      //  }
      //
      //  return item;
      //});
      //
      //deffered.resolve(data);
      //
      //return deffered.promise;
    }

    function getVehicleTraffic(vehicleID) {
      var request = $http({
        method: "get",
        url: turnoverBaseURL + format('vehicles/{}/traffics', vehicleID),
        params: {
          limit: 100,
          sort: '-timestamp'
        }
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getAllTraffics(dtStart, dtEnd) {
      var reqParams = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtEnd.unix()
      };

      var request = $http({
        method: "get",
        url: operArmBaseURL + 'traffics',
        params: reqParams
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getPrices(appID) {
      var request = $http({
        method: "get",
        url: baseURL + `applications/${appID}/prices`
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function getServices(appID) {
      var request = $http({
        method: "get",
        url: baseURL + `applications/${appID}/services`
      });
      return ( request.then(handleSuccess, handleError) );
    }


    //************************************************************************************
    // Below are methods which return or work with app specific models (not server models)

    function getCurrencies() {
      var currencies = [];
      var deffered = $q.defer();

      getApps().then(
        function(srvApps) {
          if (srvApps.length === 0) {
            deffered.resolve(currencies);
          }
          var appID = srvApps[0].id;
          getAppCurrencies(appID).then(
            function(srvCurrencies) {
              srvCurrencies.forEach(function (srvCurr) {
                var curr = {};
                curr.srvID = srvCurr.id;
                curr.code = srvCurr.symbol;
                curr.name = srvCurr.title;
                curr.isPrivileged = srvCurr.exemption !== null;
                curr.privilege = srvCurr.exemption !== null ? srvCurr.exemption : 'нет льгот';
                curr.isAbonnement = !srvCurr.countable;
                currencies.push(curr);
              });

              deffered.resolve(currencies);
            },
            function(reason) {
              deffered.reject(reason);
            }
          );

        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getCards(currencies) {
      var newCards = [];
      var deffered = $q.defer();

      getAccounts().then(
        function (srvAccounts) {
          var accInd = 0;
          srvAccounts.forEach(function (srvAcc) {
            var card = {};
            card.id = srvAcc.number;
            card.srvAccountID = srvAcc.id;
            // TODO use real card state here
            card.state = "success";

            card.isESEK = isEsek(srvAcc);
            card.personID = srvAcc.userId;

            // Request bags for the account
            card.bags = [];
            card.isBlocked = false;
            getAccountMedias(srvAcc.id).then(
              function(medias) {
                if (medias && medias.length > 0) {
                  // Get 1st media
                  // Get card RFID
                  var media = medias[0];
                  card.RFID = media.rfid;
                  card.mediaSrvID = media.id;
                  // Find card activation time
                  var stateActivated = _(media.states).find(function(state) {
                    return state.state === "activated";
                  });
                  if (stateActivated) {
                    card.activatedAt = moment.unix(stateActivated.timestamp);
                  }
                  else {
                    card.activatedAt = null;
                  }

                  // is card blocked?
                  if (media.states && media.states.length > 0) {
                    card.isBlocked = media.states[0].state === "blocked";
                  }
                } // if media found
                getAccountBags(srvAcc.id).then(
                  function (srvBags) {
                    srvBags.forEach(function (srvBag) {
                      var bag = {};
                      bag.srvID = srvBag.id;
                      bag.activePeriodStart = moment.unix(srvBag.timeframe.startTimestamp);
                      bag.activePeriodFinish = moment.unix(srvBag.timeframe.finishTimestamp);

                      // Get currency by its server id
                      bag.currency = _.find(currencies, function (curr) {
                        return curr.srvID === srvBag.currencyId;
                      });

                      //log('bag');
                      card.bags.push(bag);
                    });

                    newCards.push(card);

                    // if last card, then resolve
                    if (accInd === srvAccounts.length - 1) {
                      //log('resolve');
                      deffered.resolve(newCards);
                    }

                    accInd += 1;
                  });
              });
          });
        },
        function (reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getFullyEquippedCards() {
      var deffered = $q.defer();

      getCurrencies().then(
        function (currencies) {
          getCards(currencies).then(
            function (cards) {
              var promises = _.map(cards, function(card){
                return getAccountInfo(card.srvAccountID);
              });
              $q.allSettled(promises).then(
                function (results) {
                  var newResults = _.map(results, function(res){
                    return res.state === 'fulfilled' ? res.value : null;
                  });

                  cards.forEach(function (card, cardInd) {
                    var info = newResults[cardInd];
                    if (info && info.bagInfos && info.bagInfos.length > 0) {

                      card.bags.forEach(function (bag) {
                        var bagInfo = _(info.bagInfos).find(function (bi) {
                          return bag.srvID === bi.lastTransaction.bagId;
                        });
                        if (bagInfo) {
                          bag.balance = bagInfo.balance;
                          bag.transCount = bagInfo.operationCounter;
                          // Create bag latest trans
                          var event = {};
                          event.id = bagInfo.lastTransaction.id;
                          event.srvTransactionID = bagInfo.lastTransaction.id;
                          event.timestamp = moment.unix(bagInfo.lastTransaction.timestamp);
                          event.operation = bagInfo.lastTransaction.type;
                          event.currency = bag.currency;
                          event.value = bagInfo.lastTransaction.value;
                          event.isSuccess = bagInfo.lastTransaction.status === "valid";
                          event.isPayment = bagInfo.lastTransaction.type === "payment";
                          event.isReplenishment = bagInfo.lastTransaction.type === "replenishment";
                          bag.latestTrans = event;
                        }
                      });

                      // Find bag with latest transaction
                      var latestBag = _.max(card.bags, function (bag) {
                        return bag.latestTrans.timestamp.unix();
                      });
                      // Set latest flag for the bag
                      if (latestBag) {
                        latestBag.isLatestTrans = true;
                        // Set card latest trans
                        card.latestTrans = latestBag.latestTrans;
                      }
                    }
                  });

                  // Sort cards by latest trans time desc
                  cards = _.sortBy(cards, function (card) {
                    return -card.id;
                  });
                  cards = _.sortBy(cards, function (card) {
                    return (card.latestTrans) ? -card.latestTrans.timestamp : -moment.unix(0);
                  });

                  deffered.resolve(cards);
                },
                function () {

                }
              );
            },
            function (reason) {
              deffered.reject(reason);
            }
          );
        },
        function (reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getCard(cardNum) {
      var deffered = $q.defer();
      getCurrencies().then(function (currencies) {
          getCards(currencies).then(function (cards) {
              var logicCard = findCardByNum(cards, cardNum);
              deffered.resolve(logicCard);
            },
            function (reason) {
              deffered.reject(reason);
            });
        },
        function (reason) {
          deffered.reject(reason);
        });
      return deffered.promise;
    }

    function findCardBySrvID(cards, srvID) {
      var card2ret = undefined;
      _(cards).forEach(function(card) {
        if (card.srvID === srvID) {
          card2ret = card;
          return false;
        }
      });
      return card2ret;
    }

    function findCardByNum(cards, num) {
      var card2ret = undefined;
      _(cards).forEach(function(card) {
        if (card.id === num) {
          card2ret = card;
          return false;
        }
      });
      return card2ret;
    }

    function findCardByBagID(cards, srvBagID) {
      var card2ret = undefined;
      _(cards).forEach(function(card) {
        _(card.bags).forEach(function(bag) {
          if (bag.srvID === srvBagID) {
            card2ret = card;
            return false;
          }
        });
        if (card2ret) {
          return false;
        }
      });
      return card2ret;
    }

    function findBag(cards, srvBagID) {
      var bag2ret = undefined;
      _(cards).forEach(function(card) {
        _(card.bags).forEach(function(bag) {
          if (bag.srvID === srvBagID) {
            bag2ret = bag;
            return false;
          }
        });
        if (bag2ret) {
          return false;
        }
      });
      return bag2ret;
    }

    function findCardBag(card, srvBagID) {
      var bag2ret = undefined;
      _(card.bags).forEach(function(bag) {
        if (bag.srvID === srvBagID) {
          bag2ret = bag;
          return false;
        }
      });
      return bag2ret;
    }

    function getEvents() {
      var deffered = $q.defer();
      getCurrencies().then(
        function (currencies) {
          //$scope.currencies = currencies;
          getCards(currencies).then(
            function (cards) {
              getAllTransactions().then(
                function (srvTransactions) {
                  var events = [];
                  var eventInd = 0;
                  srvTransactions.forEach(function (srvTrans) {
                    var event = {};
                    event.id = eventInd + 1;
                    event.srvTransactionID = srvTrans.id;
                    event.timestamp = moment.unix(srvTrans.timestamp);
                    //event.card = findCardByBagID(cards, srvTrans.bagId);
                    //event.bag = findBag(cards, srvTrans.bagId);
                    event.operation = srvTrans.type;

                    var bag = findBag(cards, srvTrans.bagId);
                    if (bag) {
                      event.currency = bag.currency;
                    }

                    event.value = srvTrans.value;
                    event.isSuccess = srvTrans.status === "valid";
                    event.isPayment = srvTrans.type === "payment";
                    event.isReplenishment = srvTrans.type === "replenishment";

                    events.push(event);
                    eventInd += 1;
                  });

                  deffered.resolve(events);
                },
                function (reason) {
                  deffered.reject(reason)
                });
            },
            function (reason) {
              deffered.reject(reason)
            });
        },
        function (reason) {
          deffered.reject(reason)
        });
      return deffered.promise;
    }

    // Returns int
    function getTurnover() {
      var turnover = undefined;
      var deffered = $q.defer();

      getVehicles().then(
        function(vehicles) {
          if (vehicles.length === 0) {
            deffered.resolve(turnover);
            return;
          }
          var vehicle = vehicles[0];
          getVehicleTurnover(vehicle.id).then(
            function(srvTurnovers) {
              if (srvTurnovers.length === 0) {
                deffered.resolve(turnover);
                return;
              }
              // Get last and return quantity
              var lastSrvTurnover = srvTurnovers[srvTurnovers.length - 1];
              deffered.resolve(lastSrvTurnover.quantity);
            },
            function(reason) {
              deffered.reject(reason);
            }
          );
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    // Returns array: timestamp, value
    function getTurnoverHistory() {
      var hist = [];
      var deffered = $q.defer();

      getVehicles().then(
        function(vehicles) {
          if (vehicles.length === 0) {
            deffered.resolve(hist);
          }
          var vehicle = vehicles[0];
          getVehicleTurnover(vehicle.id).then(
            function(srvTurnovers) {
              if (srvTurnovers.length === 0) {
                deffered.resolve(hist);
              }

              // Get last and return quantity
              _(srvTurnovers).forEach(function(to) {
                var turno = {};
                turno.timestamp = moment.unix(to.timestamp);
                turno.value = to.quantity;
                hist.push(turno);
              });
              deffered.resolve(hist);
            },
            function(reason) {
              deffered.reject(reason);
            }
          );
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    // This method differs from the prev one - it returns data for all vehicles
    function getTurnoverHist(dtStart, dtEnd) {
      var hist = [];
      var deffered = $q.defer();

      var vehInd = 0;
      getVehicles().then(
        function(vehicles) {
          if (vehicles.length === 0) {
            deffered.resolve(hist);
          }
          _(vehicles).forEach(function(vehicle) {
            getVehicleTurnover(vehicle.id).then(
              function (srvTurnovers) {

                // Filter items by start and end timestamps
                var srvTurnovers = _.filter(srvTurnovers, function(evt) {
                  return moment.unix(evt.timeframe.finishTimestamp).isBetween(dtStart, dtEnd);
                });

                _(srvTurnovers).forEach(function (srvTurno) {
                  var turno = {};
                  turno.timestamp = moment.unix(srvTurno.timeframe.finishTimestamp);
                  turno.quantity = srvTurno.quantity;
                  turno.distance = srvTurno.distance;
                  turno.vehicle = vehicle.title;
                  hist.push(turno);
                });

                // if last vehicle, then resolve
                if (vehInd === vehicles.length - 1) {
                  hist = _.sortBy(hist, function (item) {
                    return item.timestamp;
                  });

                  deffered.resolve(hist);
                }

                vehInd += 1;
              },
              function (reason) {
                deffered.reject(reason);
              }
            );
          });
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    //***************************
    // Person data and privileges

    // Returns server specific models
    function getExemptions() {
      var request = $http({
        method: "get",
        url: personDataBaseURL + "exemptions"
      });
      return ( request.then(handleSuccess, handleError) );
    }

    // Returns server specific models
    function getSrvPersons() {
      var request = $http({
        method: "get",
        url: personDataBaseURL + "persons"
      });
      return ( request.then(handleSuccess, handleError) );
    }

    // Returns app specific models
    function getPrivileges() {
      var privils = [];
      var deffered = $q.defer();

      getExemptions().then(
        function (exemptions) {
          exemptions.forEach(function (exempt) {
            var priv = {};
            priv.srvID = exempt.id;
            priv.code = exempt.ouid;
            priv.name = exempt.title;
            privils.push(priv);
          });

          deffered.resolve(privils);
        },
        function (reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    // Returns app specific models - Person including its privileges
    function getPerson(personID) {
      var person2ret = null;
      var deffered = $q.defer();

      if (personID === null) {
        deffered.reject("person id is null");
        return deffered.promise;
      }

      getPrivileges().then(
        function(privileges) {
          getSrvPersons().then(
            function (srvPersons) {
              var foundSrvPer = _(srvPersons).find(function (srvPer) {
                return srvPer.uuid === personID;
              });
              if (!foundSrvPer) {
                deffered.resolve(person2ret);
                return deffered.promise;
              }

              person2ret = {};
              person2ret.srvID = foundSrvPer.id;
              person2ret.id = personID;
              person2ret.name = foundSrvPer.name;

              // get person privileges
              var personPrivils = [];
              foundSrvPer.exemptions[0].forEach(function (exempt) {
                var foundPriv = _(privileges).find(function (pr) {
                  return pr.srvID === exempt.exemptionid;
                });
                if (foundPriv) {
                  var priv2attach = angular.copy(foundPriv);
                  if (exempt.timeframe) {
                    if (exempt.timeframe.startTimestamp) {
                      priv2attach.activePeriodStart = moment.unix(exempt.timeframe.startTimestamp);
                    }
                    if (exempt.timeframe.finishTimestamp) {
                      priv2attach.activePeriodFinish = moment.unix(exempt.timeframe.finishTimestamp);
                    }
                  }
                  personPrivils.push(priv2attach);
                }
              });
              person2ret.privileges = personPrivils;

              deffered.resolve(person2ret);
            },
            function (reason) {
              deffered.reject(reason);
            }
          );
        },
        function (reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    // Person data and privileges
    //***************************


    // buses table
    function getPassengersInOut() {
      if (isRestDebug) {
        return restFake.getPassengersInOut();
      }

      var passInOuts = [];
      var deffered = $q.defer();

      getVehicles().then(
        function (srvVehicles) {
          var vehInd = 0;
          srvVehicles.forEach(function (srvVeh) {
            getVehicleTraffic(srvVeh.id).then(
              function (srvTraffics) {
                // Create inOuts from srv traffics
                var inOuts = [];
                srvTraffics.forEach(function(traf){
                  var inout = {};

                  inout.timestamp = moment.unix(traf.timestamp);
                  inout.busID = srvVeh.terminal_id;
                  if (traf.delta >= 0) {
                    inout.input = traf.delta;
                  }
                  else {
                    inout.output = -traf.delta;
                  }

                  inOuts.push(inout);
                });

                passInOuts = passInOuts.concat(inOuts);

                // if last vehicle, then resolve
                if (vehInd === srvVehicles.length - 1) {
                  // sort by timestamp desc
                  passInOuts = _.sortBy(passInOuts, function (iO) {
                    return -iO.timestamp;
                  });

                  //log('resolve');
                  deffered.resolve(passInOuts);
                }

                vehInd += 1;
              });
          });
        },
        function (reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getPassengersInHist(dtStart, dtEnd) {
      var deffered = $q.defer();

      getPassengersInOut().then(
        function (inOuts) {
          // Filter items by start and end timestamps
          var inOuts = _.filter(inOuts, function(evt) {
            return evt.timestamp.isBetween(dtStart, dtEnd);
          });

          // Filter passenger out items
          var inOuts = _.filter(inOuts, function(evt) {
            return evt.input;
          });

          // Sort remaining items by timestamp asc (just reverse)
          inOuts.reverse();

          deffered.resolve(inOuts);
        },
        function (reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function activateEsek(hwCard, activatedAt, expiredAt) {
      var data2send = {
        rfid: hwCard.rfid,
        number: hwCard.num,
        timeframe: {
          startTimestamp: activatedAt.unix(),
          finishTimestamp: expiredAt.unix()
        },
        // TODO use real user id during ESEK activation
        user_id: "567834901"
      };

      var request = $http({
        method: "post",
        url: operArmBaseURL + 'activatecard',
        data: data2send
      });

      return ( request.then(handleSuccess, handleError) );
    }

    function activateTicket(hwTicket, activatedAt, expiredAt) {
      var data2send = {
        rfid: hwTicket.rfid,
        number: hwTicket.num,
        timeframe: {
          startTimestamp: activatedAt.unix(),
          finishTimestamp: expiredAt.unix()
        },
        replenishment_data: {}
      };

      if (hwTicket.isFixedTripNumTicket) {
        data2send.replenishment_data.symbol = 'PFTT';
        data2send.replenishment_data.value = hwTicket.tripsLeft;
      }
      else if (hwTicket.isMonthTicketFullPrice) {
        data2send.replenishment_data.symbol = 'PR';
        data2send.replenishment_data.value = 1;
      }
      else if (hwTicket.isMonthTicketPensioner) {
        data2send.replenishment_data.symbol = 'PRP';
        data2send.replenishment_data.value = 1;
      }

      var request = $http({
        method: "post",
        url: operArmBaseURL + 'activatecard',
        data: data2send
      });

      return ( request.then(handleSuccess, handleError) );
    }


    //*************************************************************************
    // Comms with own backend

    function getHwCard() {
      var deffered = $q.defer();

      $http.get('/api/cards').then(
        function (resp) {
          var card = resp.data.card;
          if (card) {
            card.activePeriodStart = moment.unix(card.activePeriodStart);
            card.activePeriodFinish = moment.unix(card.activePeriodFinish);
          }
          deffered.resolve(card);
        },
        function (reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getHwTicket() {
      var deffered = $q.defer();

      $http.get('/api/tickets').then(
        function (resp) {
          var ticket = resp.data.ticket;
          if (ticket) {
            ticket.activePeriodStart = moment.unix(ticket.activePeriodStart);
            ticket.activePeriodFinish = moment.unix(ticket.activePeriodFinish);
          }
          deffered.resolve(ticket);
        },
        function (reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function activateTicketCardReader(activatedAt, expiredAt) {
      $http.post('/api/tickets/activate', {
        start: activatedAt.unix(),
        end: expiredAt.unix()
      });
    }

    // Comms with own backend
    //*************************************************************************

    // PUBLIC METHODS
    //=====================================================


    //*************************************************************************
    // PRIVATE METHODS

    function handleError(response) {
      //log(JSON.stringify(response.config, null, 2));
      $rootScope.urlCausedError = response.config.url;

      if (response.status == 502 || response.status == 503 || response.status == 0) {
        $rootScope.isRestUnavailable = true;
        //alertService.add("danger", format('Адрес {} недоступен', $rootScope.urlCausedError));
        log(format('Адрес {} недоступен', $rootScope.urlCausedError));
      }
      else if (response.status == 500) {
        $rootScope.isRestError = true;
        //alertService.add("danger", format('При обращении по адресу {} произошла ошибка',
        //  $rootScope.urlCausedError));
        log(format('При обращении по адресу {} произошла ошибка',
          $rootScope.urlCausedError));
      }
      else {
        if ($rootScope.isRestUnavailable || $rootScope.isRestError) {
          $rootScope.isRestUnavailable = false;
          $rootScope.isRestError = false;
        }
        else {
          $rootScope.isRestUnavailable = false;
          $rootScope.isRestError = false;
        }
      }

      // The API response from the server should be returned in a
      // normalized format. However, if the request was not handled by the
      // server (or what not handles properly - ex. server error), then we
      // may have to normalize it on our end, as best we can.
      if (!angular.isObject(response.data) || !response.data.message) {
        return $q.reject({
          msg: "An unknown error occurred.",
          code: response.status
        });
      }
      // Otherwise, use expected error message.
      return $q.reject({
        msg: response.data.message,
        code: response.status
      });
    }

    // I transform the successful response, unwrapping the application data
    // from the API response payload.
    function handleSuccess(response) {
      $rootScope.isRestUnavailable = false;
      $rootScope.isRestError = false;
      $rootScope.urlCausedError = null;
      return ( response.data );
    }

    function log(msg) {
      $log.debug(msg);
    }

    // PRIVATE METHODS
    //*************************************************************************


    function postTurnover(timestamp, value) {
      var request = $http({
        method: "post",
        url: baseURL + 'vehicles/1/turnovers',
        data: [{
          "timeframe": {
            "startTimestamp": timestamp.unix() - 1000,
            "finishTimestamp": timestamp.unix()
          },
          "distance": 1000,
          "quantity": value
          }]
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function esekReplenishPoints(card, points) {
      var request = $http({
        method: "post",
        url: baseURL + 'replenishments',
        data: {
          "symbol":"TRB",
          "rfid": card.RFID,
          "timestamp": moment().unix(),
            "timeframe": {
            "startTimestamp": null,
              "finishTimestamp": null
          },
          "value": points
        }
      });
      return ( request.then(handleSuccess, handleError) );
    }

    // ticket type:
    // 0 - unknown
    // 1 - pensioner
    // 2 - full price
    //
    // Month is 1-based.
    function esekBuyMonthTicket(card, ticketType, month, year) {
      // Calc currency code
      var currencyCode = "";
      if (ticketType === 1) {
        currencyCode = "PRP";
      }
      else if (ticketType === 2) {
        currencyCode = "PR";
      }
      else {
        throw "Unknown month ticket type: " + ticketType;
      }

      // Calc start, stop timestamps
      var startTs = moment().year(year).month(month - 1).date(1).hour(0).minute(0).second(0).millisecond(0);
      var endTs = moment().year(year).month(month - 1).add(1, 'months').date(1).hour(0).minute(0).second(0).millisecond(0);

      var request = $http({
        method: "post",
        url: baseURL + 'replenishments',
        data: {
          "symbol": currencyCode,
          "rfid": card.RFID,
          "timestamp": moment().unix(),
          "timeframe": {
            "startTimestamp": startTs.unix(),
            "finishTimestamp": endTs.unix()
          },
          "value": 1
        }
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function esekBuyTicket(card, trips) {
      var request = $http({
        method: "post",
        url: baseURL + 'replenishments',
        data: {
          "symbol":"PFTT",
          "rfid": card.RFID,
          "timestamp": moment().unix(),
          "timeframe": {
            "startTimestamp": moment().startOf('day').unix(),
            "finishTimestamp": moment().startOf('day').add(1, 'years').unix()
          },
          "value": trips
        }
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function makePayment(timestamp) {
      var request = $http({
        method: "post",
        url: baseURL + 'payment',
        data: {
          "rfid": "1111-2222-3333-4444",
          "timestamp": timestamp.unix(),
          "serviceId": 3,
          "applicationId": 3,
          "providerId": 4
        }
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function blockCard(card) {
      var request = $http({
        method: "post",
        url: baseURL + format('accounts/{}/medias/{}/states', card.srvAccountID, card.mediaSrvID),
        data: '"blocked"'
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function unblockCard(card) {
      var request = $http({
        method: "post",
        url: baseURL + format('accounts/{}/medias/{}/states', card.srvAccountID, card.mediaSrvID),
        data: '"activated"'
      });
      return ( request.then(handleSuccess, handleError) );
    }


    //========================================================
    // Acceptant stat

    function getStatPaidPrivileges(dtStart, dtEnd) {
      //return getStatPaidPrivilegesDUMMY(dtStart, dtEnd);

      var deffered = $q.defer();
      var data = [];
      var params = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtEnd.unix(),
        windowTime: 86400 // sec in day
      };

      $http({
        method: "get",
        url: baseURL + 'stat/transactions/exemptions',
        params: params
      }).then(
        function(stat) {
          var days = getDays(dtStart, dtEnd);
          days.forEach(function (day, dayIndex) {
            var fullyPaid = 0;
            var privileged = 0;
            var privilInfo = stat.data[dayIndex].exemptions;
            if (privilInfo && privilInfo.length > 0) { // if data exist
              // Find item where "exemption" field is null
              var fullyPaidItem = _.find(privilInfo, function(item) {
                return item.exemption === null;
              });
              if (fullyPaidItem) {
                fullyPaid = fullyPaidItem.number;
              }

              // Get all remaining items and sum their numbers
              var privilItems = _.filter(privilInfo, function(item) {
                return item.exemption !== null;
              });
              privileged = _.reduce(privilItems, function(total, item) {
                return total + item.number;
              }, 0);
            }

            var dateItem = {
              day: day,
              fullyPaid: fullyPaid,
              privileged: privileged
            };
            data.push(dateItem);
          });

          deffered.resolve(data);
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getStatPrivileges(dtStart, dtEnd) {
      var deffered = $q.defer();
      var data = [];
      var params = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtEnd.unix()
      };

      $http({
        method: "get",
        url: baseURL + 'stat/transactions/exemptions',
        params: params
      }).then(
        function(stat) {
          var privilInfos = stat.data[0].exemptions;
          if (privilInfos && privilInfos.length > 0) { // if data exist
            privilInfos.forEach(function(privInfo) {
              var dataItem = {};
              dataItem.privilege = privInfo.exemption !== null ? privInfo.exemption : "нет льгот";
              dataItem.transactionCount = privInfo.number;
              data.push(dataItem);
            });
          }

          deffered.resolve(data);
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getStatTotalPaidPrivileged(dtStart, dtEnd) {
      var deffered = $q.defer();
      var retval = {
        fullyPaid: 0,
        privileged: 0
      };

      getStatPaidPrivileges(dtStart, dtEnd).then(
        function (statPerDay) {
          retval.privileged = _.reduce(statPerDay, function (total, item) {
            return total + item.privileged;
          }, 0);

          retval.fullyPaid = _.reduce(statPerDay, function (total, item) {
            return total + item.fullyPaid;
          }, 0);

          deffered.resolve(retval);
        },
        function (reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getStatPaidPrivilegesDUMMY(dtStart, dtEnd) {
      var deffered = $q.defer();

      var data = [];
      var days = getDays(dtStart, dtEnd);
      days.forEach(function(day) {
        var dateItem = {
          day: day,
          fullyPaid: 1,
          privileged: 2
        };
        data.push(dateItem);
      });

      deffered.resolve(data);

      return deffered.promise;
    }

    function getStatPaidByCardType(dtStart, dtEnd) {
      //return getStatPaidByCardTypeDUMMY(dtStart, dtEnd);

      var deffered = $q.defer();
      var data = [];
      var params = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtEnd.unix(),
        windowTime: 86400 // sec in day
      };

      $http({
        method: "get",
        url: baseURL + 'stat/transactions/users',
        params: params
      }).then(
        function(stat) {
          var days = getDays(dtStart, dtEnd);
          days.forEach(function (day, dayIndex) {
            var dateItem = {
              day: day,
              totalPaidByEsek: stat.data[dayIndex].personal,
              totalPaidByTicket: stat.data[dayIndex].impersonal
            };
            data.push(dateItem);
          });

          deffered.resolve(data);
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getStatTotalPaidByCardType(dtStart, dtEnd) {
      var deffered = $q.defer();
      var data = [];
      var params = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtEnd.unix()
      };

      $http({
        method: "get",
        url: baseURL + 'stat/transactions/users',
        params: params
      }).then(
        function(stat) {
          deffered.resolve({
            totalPaidByEsek: stat.data[0].personal,
            totalPaidByTicket: stat.data[0].impersonal
          });
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getStatPaidByCardTypeDUMMY(dtStart, dtEnd) {
      var deffered = $q.defer();

      var data = [];
      var days = getDays(dtStart, dtEnd);
      days.forEach(function(day) {
        var dateItem = {
          day: day,
          totalPaidByEsek: _.random(0, 100),
          totalPaidByTicket: _.random(0, 1000)
        };
        data.push(dateItem);
      });

      deffered.resolve(data);

      return deffered.promise;
    }

    function getStatTotalPassengers(dtStart, dtFinish) {
      var deffered = $q.defer();

      var params = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtFinish.unix()
      };

      $http({
        method: "get",
        url: turnoverBaseURL + 'stat/traffics',
        params: params
      }).then(
        function(stat) {
          deffered.resolve(stat.data._summary_owner._summary_vehicle[0].amount_inlet);
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getStatPassengersPerDay(dtStart, dtEnd) {
      if (isRestDebug) {
        return restFake.getStatPassengersPerDay(dtStart, dtEnd);
      }

      var deffered = $q.defer();
      var data = [];
      var params = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtEnd.unix(),
        windowTime: 86400 // sec in day
      };

      $http({
        method: "get",
        url: turnoverBaseURL + 'stat/traffics',
        params: params
      }).then(
        function(stat) {
          var days = getDays(dtStart, dtEnd);
          days.forEach(function (day, dayIndex) {

            var dateItem = {
              day: day,
              passengers: stat.data._summary_owner._summary_vehicle[dayIndex].amount_inlet,
              passCountErr: stat.data._summary_owner._summary_vehicle[dayIndex].error
            };
            data.push(dateItem);
          });

          deffered.resolve(data);
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getStatPassengersPerDayPerBus(dtStart, dtEnd) {
      if (isRestDebug) {
        return restFake.getStatPassengersPerDayPerBus(dtStart, dtEnd);
      }
      var deffered = $q.defer();
      var data = [];
      var params = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtEnd.unix(),
        windowTime: 86400 // sec in day
      };

      $http({
        method: "get",
        url: turnoverBaseURL + 'stat/traffics',
        params: params
      }).then(
        function(resp) {
          const respData = resp.data;

          // Find 1st not "_summary_owner" attr
          const dataAttrName = _.find(Object.getOwnPropertyNames(respData), function (propName) {
            return propName !== "_summary_owner";
          });
          const dataObj = respData[dataAttrName];

          // Get bus names
          const busNames = _.filter(Object.getOwnPropertyNames(dataObj), propName => propName !== "_summary_vehicle");

          var days = getDays(dtStart, dtEnd);
          days.forEach(function (day, dayIndex) {
            busNames.forEach(function (bus) {

              var dateItem = {
                day: day,
                bus: bus,
                passengers: dataObj[bus][dayIndex].amount_inlet
              };

              data.push(dateItem);
            });
          });

          deffered.resolve(data);
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getStatPassKmPerDayPerBus(dtStart, dtEnd) {
      if (isRestDebug) {
        return restFake.getStatPassKmPerDayPerBus(dtStart, dtEnd);
      }
      var deffered = $q.defer();
      var data = [];
      var params = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtEnd.unix(),
        windowTime: 86400 // sec in day
      };

      $http({
        method: "get",
        url: turnoverBaseURL + 'stat/turnovers',
        params: params
      }).then(
        function(resp) {
          const respData = resp.data;

          // Find 1st not "_summary_owner" attr
          const dataAttrName = _.find(Object.getOwnPropertyNames(respData), function (propName) {
            return propName !== "_summary_owner";
          });
          const dataObj = respData[dataAttrName];

          // Get bus names
          const busNames = _.filter(Object.getOwnPropertyNames(dataObj), propName => propName !== "_summary_vehicle");

          var days = getDays(dtStart, dtEnd);
          days.forEach(function (day, dayIndex) {
            busNames.forEach(function (bus) {

              var dateItem = {
                day: day,
                bus: bus,
                passKm: Math.round(dataObj[bus][dayIndex].amount_turnover / 1000)
              };

              data.push(dateItem);
            });
          });

          deffered.resolve(data);
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getStatBusesPerDay(dtStart, dtEnd) {
      if (isRestDebug) {
        return restFake.getStatBusesPerDay(dtStart, dtEnd);
      }
      var deffered = $q.defer();
      var data = [];
      var params = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtEnd.unix(),
        windowTime: 86400 // sec in day
      };

      $http({
        method: "get",
        url: turnoverBaseURL + 'stat/active/vehicles',
        params: params
      }).then(
        function(stat) {
          var days = getDays(dtStart, dtEnd);
          days.forEach(function (day, dayIndex) {

            var dateItem = {
              day: day,
              buses: stat.data[dayIndex].amount
            };
            data.push(dateItem);
          });

          deffered.resolve(data);
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getStatTransactionsPerDay(dtStart, dtEnd) {
      var deffered = $q.defer();
      var data = [];
      var params = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtEnd.unix(),
        windowTime: 86400 // sec in day
      };

      $http({
        method: "get",
        url: baseURL + 'stat/transactions/status',
        params: params
      }).then(
        function(stat) {
          var days = getDays(dtStart, dtEnd);
          days.forEach(function (day, dayIndex) {

            var dateItem = {
              day: day,
              successes: stat.data[dayIndex].valid_number,
              errors: stat.data[dayIndex].invalid_number
            };
            data.push(dateItem);
          });

          deffered.resolve(data);
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getStatTransactions(dtStart, dtEnd) {
      var deffered = $q.defer();
      var params = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtEnd.unix()
      };

      $http({
        method: "get",
        url: baseURL + 'stat/transactions/status',
        params: params
      }).then(
        function(stat) {
          deffered.resolve({
            start: dtStart,
            end: dtEnd,
            successes: stat.data[0].valid_number,
            errors: stat.data[0].invalid_number
          });
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getStatPassengersAvgPerHour(dtStart, dtEnd, numOfDays) {
      if (isRestDebug) {
        return restFake.getStatPassengersAvgPerHour(dtStart, dtEnd);
      }

      var deffered = $q.defer();
      var data = [];
      var params = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtEnd.unix(),
        windowTime: 3600
      };

      $http({
        method: "get",
        url: turnoverBaseURL + 'stat/traffics',
        params: params
      }).then(
        function(stat) {
          stat = stat.data._summary_owner._summary_vehicle;
          var statItemCount = stat.length;

          var hours = _.times(24, function(h) {
            return h;
          });

          hours.forEach(function (hour) {
            var statItemInd = hour;
            var passengers = 0;

            while (statItemInd < statItemCount) {
              passengers += stat[statItemInd].amount_inlet;
              statItemInd += 24;
            }

            data.push(passengers);
          });

          data = _.map(data, function (item) {
            return Math.round(item / numOfDays);
          });

          deffered.resolve(data);
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getStatTotalPassKm(dtStart, dtFinish) {
      var deffered = $q.defer();

      var params = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtFinish.unix()
      };

      $http({
        method: "get",
        url: turnoverBaseURL + 'stat/turnovers',
        params: params
      }).then(
        function(stat) {
          deffered.resolve(stat.data._summary_owner._summary_vehicle[0].amount_turnover / 1000);
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getStatPassKmPerDayPerOrg(dtStart, dtFinish) {
      if (isRestDebug) {
        return restFake.getStatPassKmPerDayPerOrg(dtStart, dtFinish);
      }

      var deffered = $q.defer();

      var params = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtFinish.unix(),
        windowTime: 86400
      };

      $http({
        method: "get",
        url: turnoverBaseURL + 'stat/turnovers',
        params: params
      }).then(
        function(resp) {
          var stat = resp.data;
          var retVal = [];

          // Get org names
          var orgNames = Object.getOwnPropertyNames(stat);
          orgNames = _.filter(orgNames, function(name) {
            return name !== '_summary_owner';
          });
          //log(orgNames);

          // For every org get stat per day
          var days = getDays(dtStart, dtFinish);
          orgNames.forEach(function (org) {
            var orgItem = {
              name: org
            };
            var passKms = [];
            days.forEach(function (day, dayIndex) {
              var dayStat = {
                day: day,
                passKm: stat[org]._summary_vehicle[dayIndex].amount_turnover / 1000
              };
              passKms.push(dayStat);
            });
            orgItem.passKms = passKms;
            retVal.push(orgItem);
          });

          deffered.resolve(retVal);
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getStatPassKmPerDay(dtStart, dtFinish) {
      var deffered = $q.defer();

      getStatPassKmPerDayPerOrg(dtStart, dtFinish).then(
        function (statPerOrg) {
          let passKms = _.map(statPerOrg, 'passKms');
          if (!passKms || passKms.length === 0) {
            deffered.resolve([]);
          }
          let days = _.map(passKms[0], 'day');
          let retVal = [];
          days.forEach(function (day, dayIndex) {
            let retValItem = { day: day };
            let allPassKmsForDay = _.map(passKms, function (arr) {
              return arr[dayIndex].passKm;
            });
            retValItem.passKm = _.reduce(allPassKmsForDay, function(sum, n) {
              return sum + n;
            });
            retVal.push(retValItem);
          });

          deffered.resolve(retVal);
        },
        function (reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getStatTotalServed(dtStart, dtFinish) {
      var deffered = $q.defer();

      var params = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtFinish.unix()
      };

      $http({
        method: "get",
        url: baseURL + 'stat/transactions/users',
        params: params
      }).then(
        function(stat) {
          deffered.resolve(stat.data[0].impersonal + stat.data[0].personal);
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    // Acceptant stat
    //========================================================


    //********************************************************
    // Public dashboard stat

    function getStatReplenishment(dtStart, dtEnd) {
      if (isMyDebug) {
        return getStatReplenishmentDUMMY(dtStart, dtEnd);
      }
      var deffered = $q.defer();
      var params = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtEnd.unix()
      };

      $http({
        method: "get",
        url: baseURL + 'stat/transactions/replenishmentsinfo',
        params: params
      }).then(
        function(resp) {
          deffered.resolve(resp.data);
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getStatReplenishmentDUMMY(dtStart, dtEnd) {
      var deffered = $q.defer();
      const data = {
          total: {
            'C-PFTT': 10,
            'C-PR': 1,
            'TRB': 68
          },
          perTerminals: {
            a9b8c7: {
              'C-PFTT': 5,
              'C-PR': 1,
              'TRB': 68
            },
            a9b8d7: {
              'C-PFTT': 5
            }
          }
      };
      deffered.resolve(data);
      return deffered.promise;
    }

    function getStatPayment(dtStart, dtEnd) {
      if (isMyDebug) {
        return getStatPaymentDUMMY(dtStart, dtEnd);
      }
      var deffered = $q.defer();
      var params = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtEnd.unix()
      };

      $http({
        method: "get",
        url: baseURL + 'stat/transactions/paymentsinfo',
        params: params
      }).then(
        function(resp) {
          deffered.resolve(resp.data);
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getStatPaymentDUMMY(dtStart, dtEnd) {
      var deffered = $q.defer();
      let data = {};
      _.times(200, function (ind) {
        const dataItemName = `Bus_park_${ind + 1}`;
        data[dataItemName] = {
          intracity_passenger_traffic: ind + 1
        };
      });
      deffered.resolve(data);
      return deffered.promise;
    }

    // Public dashboard stat
    //********************************************************


    // Acceptant prices
    function getTariffs() {
      if (isRestDebug) {
        return restFake.getTariffs();
      }

      let deffered = $q.defer();

      getTransportApp().then(
        function (app) {
          getAppTariffs(app).then(
            function (tars) {
              deffered.resolve(tars);
            },
            function (reason) {
              deffered.reject(reason);
            }
          );
        },
        function (reason) {
          deffered.resolve([]);
        }
      );

      return deffered.promise;
    }

    function getAppTariffs(app) {
      let tariffs = [];
      let deffered = $q.defer();

      if (!app) {
        deffered.resolve([]);
        return deffered.promise;
      }

      $q.all([
        getCurrencies(),
        getPrices(app.id),
        getServices(app.id)
      ]).then(
        function (values) {
          let currencies = values[0];
          let prices = values[1];
          let services = values[2];

          prices.forEach(function (price) {
            // Find currency
            let curr = _.find(currencies, curr => curr.srvID === price.currencyId);
            let service = _.find(services, srv => srv.id === price.serviceId);

            if (!curr) {
              return;
            }

            let tarr = {
              currency: curr,
              price: price.value,
              name: curr.name,
              desc: service ? service.title : '',
              type: (curr.isAbonnement) ? 'Проездной' : 'Разовый',
              activePeriodStart: isInt(price.timeframe.startTimestamp) ? price.timeframe.startTimestamp : null,
              activePeriodFinish: isInt(price.timeframe.finishTimestamp) ? price.timeframe.finishTimestamp : null
            };

            tariffs.push(tarr);
          });

          deffered.resolve(tariffs);
        },
        function (reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function getTransportApp() {
      let deffered = $q.defer();

      getApps().then(
        function (apps) {
          if (!apps || apps.length === 0) {
            deffered.resolve(null);
          }
          var app2ret = _.find(apps, function (app) {
            return app.title.match(/Транспортное/i);
          });

          deffered.resolve(app2ret ? app2ret : app[0]);
        },
        function (reason) {
          deffered.resolve(null);
        }
      );

      return deffered.promise;
    }

    function login(username, passwd) {
      var deferred = $q.defer();

      $http({
        method: "post",
        url: loginUrl,
        headers: {
          'Authorization': 'Basic ' + btoa(username + ':' + passwd)
        }
      })
        .success(function (data) {
          $log.debug("Login SUCCESS");
          deferred.resolve(data.key);
        })
        .error(function (err) {
          $log.debug("Login FAILURE");
          deferred.reject(err);
        });

      return deferred.promise;
    }

    //////////////////////////////////////////////////////////////////////
    // Transport status

    // Returns server specific models
    function getTranspStatusRawData(dtStart, dtEnd) {
      if (isRestDebug) {
        return restFake.getTranspStatusRawData(dtStart, dtEnd);
      }

      var request = $http({
        method: "get",
        url: `${transpStatusUrl}?filter={"$and":[{"timestamp":{"$gte":${dtStart.unix()},"$lt":${dtEnd.unix()}}},{"servicename":"pt-statusregistry"}]}&sort=timestamp`
      });
      return ( request.then(handleSuccess, handleError) );
    }

    function compactTranspStatusRawData(transpStatusRawData) {
      return _.map(transpStatusRawData, function (d) {
        let pp = Object.getOwnPropertyNames(d.eventInfo.meta.traffic);
        let validators = Object.getOwnPropertyNames(d.eventInfo.meta.validator);
        // Possible values: FAIL, NO_SATELLITE, OK
        let gpsStatus = null;
        const gpsData = d.eventInfo.meta.gps;
        if (!gpsData) {
          gpsStatus = 'FAIL';
        }
        else {
          gpsStatus = gpsData.active ? 'OK' : 'NO_SATELLITE';
        }
        return {
          timestamp: d.eventInfo.meta.timestamp,
          vehicleID: d.eventInfo.meta.vehicleId,
          pp: pp,
          validators: validators,
          gpsStatus: gpsStatus
        };
      });
    }

    // Transport status
    //////////////////////////////////////////////////////////////////////


    function getPaymentsBy(dtStart, dtFinish, currencyIds, busNames) {
      if (isRestDebug) {
        return restFake.getPaymentsBy(dtStart, dtFinish, currencyIds, busNames);
      }

      var deffered = $q.defer();

      var params = {
        startTimestamp: dtStart.unix(),
        finishTimestamp: dtFinish.unix(),
        sort: '-timestamp'
      };
      let payMethFilterSentence = createFilterSentence("currencyId", currencyIds);
      let busFilterSentence = createFilterSentence("source.terminal", busNames);
      if (payMethFilterSentence && busFilterSentence) {
        params.filter = `{"$and": [${busFilterSentence}, ${payMethFilterSentence}]}`;
      }
      else {
        if (payMethFilterSentence) {
          params.filter = payMethFilterSentence;
        }
        if (busFilterSentence) {
          params.filter = busFilterSentence;
        }
      }

      $http({
        method: "get",
        url: baseURL + 'stat/transactions/payments',
        params: params
      }).then(
        function(resp) {
          deffered.resolve(resp.data);
        },
        function(reason) {
          deffered.reject(reason);
        }
      );

      return deffered.promise;
    }

    function createFilterSentence(attrName, attrValues) {
      let filterSentence = null;
      if (attrValues && attrValues.length > 0) {
        if (attrValues.length === 1) {
          filterSentence = `{ "${attrName}": ${getFilterAttrVal(attrValues[0])} }`;
        }
        else {
          filterSentence = `{ "${attrName}": { "$in": [ ${getFilterAttrVals(attrValues)} ] } }`;
        }
      }
      return filterSentence;
    }

    function getFilterAttrVal(attrVal) {
      let retval = null;
      switch (typeof attrVal) {
        case 'string':
          retval = `"${attrVal}"`;
          break;
        case 'number':
          retval = attrVal.toString();
          break;
        default:
          retval = attrVal.toString();
          break;
      }
      return retval;
    }

    function getFilterAttrVals(attrVals) {
      let retval = null;
      switch (typeof attrVals[0]) {
        case 'string':
          retval = _.map(attrVals, getFilterAttrVal);
          retval = retval.join();
          break;
        case 'number':
          retval = attrVals.toString();
          break;
        default:
          retval = attrVals.toString();
          break;
      }
      return retval;
    }

    function isEsek(account) {
      return account.userId !== undefined && account.userId !== null
    }


    // Return public API
    return ({
      getAccounts:      getAccounts,
      getAccountInfo:   getAccountInfo,
      getAccountBags:   getAccountBags,
      getAccountTransactions: getAccountTransactions,
      getApps:          getApps,
      getAppCurrencies: getAppCurrencies,
      getAppProviders: getAppProviders,
      getAllProviders: getAllProviders,
      getAllTransactions: getAllTransactions,
      getVehicles:        getVehicles,
      getTerminals:       getTerminals,
      getVehicleTraffic:  getVehicleTraffic,
      getPrices: getPrices,
      //-------------------------------------------------------------
      // methods which return app specific models (not server models)
      getCurrencies:    getCurrencies,
      getCards:         getCards,
      getFullyEquippedCards: getFullyEquippedCards,
      getCard:          getCard,
      findCardBySrvID:  findCardBySrvID,
      findCardByNum:    findCardByNum,
      findCardByBagID:  findCardByBagID,
      findCardBag:      findCardBag,
      findBag:          findBag,
      getEvents:        getEvents,
      //calcBalance:      calcBalance,
      //calcTransactions: calcTransactions,
      getTurnover:      getTurnover,
      getTurnoverHistory: getTurnoverHistory,
      // Person data and privileges
      getPerson: getPerson,
      // buses table
      getPassengersInOut: getPassengersInOut,
      // methods necessary only for the testing, debugging
      postTurnover:     postTurnover,
      makePayment:      makePayment,
      // just helper
      getBaseURL: getBaseURL,

      activateEsek:   activateEsek,
      activateTicket: activateTicket,
      //----------------------------
      // Comm with the backend
      getHwCard:                getHwCard,
      getHwTicket:              getHwTicket,
      activateTicketCardReader: activateTicketCardReader,
      // ESEK opers
      esekReplenishPoints: esekReplenishPoints,
      esekBuyMonthTicket:  esekBuyMonthTicket,
      esekBuyTicket:       esekBuyTicket,
      // card block, unblock
      blockCard: blockCard,
      unblockCard: unblockCard,
      // Dashboard charts
      getPassengersInHist: getPassengersInHist,
      getTurnoverHist: getTurnoverHist,

      //========================================================
      // Acceptant stat

      getStatPaidPrivileges: getStatPaidPrivileges,
      getStatTotalPaidPrivileged: getStatTotalPaidPrivileged,
      getStatPrivileges: getStatPrivileges,
      getStatPaidByCardType: getStatPaidByCardType,
      getStatTotalPaidByCardType: getStatTotalPaidByCardType,
      getStatTotalPassengers: getStatTotalPassengers,
      getStatTotalPassKm: getStatTotalPassKm,
      getStatTotalServed: getStatTotalServed,
      getStatPassengersPerDay: getStatPassengersPerDay,
      getStatPassengersPerDayPerBus: getStatPassengersPerDayPerBus,
      getStatBusesPerDay: getStatBusesPerDay,
      getStatPassengersAvgPerHour: getStatPassengersAvgPerHour,
      getStatPassKmPerDayPerOrg: getStatPassKmPerDayPerOrg,
      getStatTransactionsPerDay: getStatTransactionsPerDay,
      getStatPassKmPerDay: getStatPassKmPerDay,
      getStatPassKmPerDayPerBus: getStatPassKmPerDayPerBus,
      getStatTransactions: getStatTransactions,

      // Acceptant stat
      //========================================================

      // Acceptant prices
      getTariffs: getTariffs, // tariffs for the transport app
      getAppTariffs: getAppTariffs,

      // login
      login: login,

      getTranspStatusRawData: getTranspStatusRawData,
      compactTranspStatusRawData: compactTranspStatusRawData,

      // arm urls
      getAcceptantUrl: getAcceptantUrl,
      getAcceptant1Url: getAcceptant1Url,
      getAcceptant2Url: getAcceptant2Url,
      getUptimeUrl: getUptimeUrl,
      getDashboardUrl: getDashboardUrl,
      getCtrlPanelUrl: getCtrlPanelUrl,
      getArmBankaUrl: getArmBankaUrl,

      getPaymentsBy: getPaymentsBy,
      isEsek: isEsek,

      // Public dashboard stat
      getStatReplenishment: getStatReplenishment,
      getStatPayment: getStatPayment

    });
  }
);
