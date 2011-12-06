var fs = require('fs'),
    path = require('path'),
    TestIt = require('test_it');

var FileHandler = require('../').FileHandler;

var MockRequest = require('./MockRequestResponse.js').MockRequest;
var MockResponse = require('./MockRequestResponse.js').MockResponse;

var timeout = 1000;

TestIt('TestFileHandler', {
  
  'test file handler setup without base': function (test) {
    
    FileHandler.setup(path.resolve('.', 'MockNoBaseConfig.json'));
    
    var targetPath = path.resolve(__dirname, '..', 'client');
    test.assertEqual(targetPath, FileHandler.base, 
      'FileHandler base should be the same as expect');
    
  },
  
  'test file handler setup': function (test) {
    
    FileHandler.setup(path.resolve('.', 'MockConfig.json'));
    
    var targetPath = path.join(__dirname, 'client');
    test.assertEqual(targetPath, FileHandler.base, 
      'FileHandler base should live in test');
    
  },
  
  'test request exists file': function (test) {
    
    var done = false;
    
    var request = new MockRequest('GET', '/sample.txt', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    FileHandler.request(request, response, null);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        var sample = fs.readFileSync('client/sample.txt', 'utf8');
        test.assertEqual(sample, response.message);
      });
    
  },
  
  'test request not exists file': function (test) {
    
    var done = false;
    
    var request = new MockRequest('GET', '/nofile.txt', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    FileHandler.request(request, response, null);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(404, response.statusCode);
      });
    
  },
  
  'test request folder': function (test) {
    
    var done = false;
    
    var request = new MockRequest('GET', '/sample', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    FileHandler.request(request, response, null);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(404, response.statusCode);
      });
    
  },
  
  'test request file in folder': function (test) {
    
    var done = false;
    
    var request = new MockRequest('GET', '/sample/secret.txt', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    FileHandler.request(request, response, null);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        var secret = fs.readFileSync('client/sample/secret.txt', 'utf8');
        test.assertEqual(secret, response.message);
      });
    
  }

});
