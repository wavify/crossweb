var fs = require('fs'),
    path = require('path'),
    TestIt = require('test_it');

var GuardFilter = require('../').GuardFilter;

var MockRequest = require('./MockRequestResponse.js').MockRequest;
var MockResponse = require('./MockRequestResponse.js').MockResponse;

var timeout = 1000;

TestIt('TestGuardFilter', {
  
  'test something': function (test) {
    console.log ('test');
  }
  
});
