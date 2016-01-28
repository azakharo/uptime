'use strict';

describe('findPeriods', function () {

  it('always online', testAlwaysOnline);

  // 2. Almost always offline, 1 short online per in the middle
  // 3. Online, offline, online

  it('very short time limit', testShortTimeLimit);
});
