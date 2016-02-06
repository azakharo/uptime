'use strict';

describe('Controller: MytestCtrl', function () {

  // load the controller's module
  beforeEach(module('armUptimeApp'));

  var MytestCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MytestCtrl = $controller('MytestCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
