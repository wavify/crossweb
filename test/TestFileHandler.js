var fs = require('fs'),
    path = require('path'),
    TestIt = require('test_it');

var FileHandler = require('../lib/handlers/FileHandler').FileHandler;

var MockRequest = require('./MockRequestResponse.js').MockRequest;
var MockResponse = require('./MockRequestResponse.js').MockResponse;

var timeout = 1000;

TestIt('TestFileHandler', {
  
  'test file handler setup without base': function (test) {
    
    FileHandler.setup(path.join(__dirname, 'MockNoBaseConfig.json'));
    
    var targetPath = path.resolve(__dirname, '..', 'client');
    test.assertEqual(targetPath, FileHandler.base, 
      'FileHandler base should be the same as expect');
    
  },
  
  'test file handler setup': function (test) {
    
    FileHandler.setup(path.join(__dirname, 'MockConfig.json'));
    
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
    
    FileHandler.request(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        var samplePath = path.join(__dirname, 'client', 'sample.txt');
        var sample = fs.readFileSync(samplePath, 'utf8');
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
    
    FileHandler.request(request, response);
    
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
    
    FileHandler.request(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(404, response.statusCode);
      });
    
  },
  
  'test request folder that have index file': function (test) {
    var done = false;
    
    var request = new MockRequest('GET', '/', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    FileHandler.request(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assertEqual(301, response.statusCode);
        test.assertEqual('/index.html', response.header.Location,
          'Request folder should redirect to index if that folder have an index file.');
      });
  },
  
  'test request file in folder': function (test) {
    
    var done = false;
    
    var request = new MockRequest('GET', '/sample/secret.txt', {});
    var response = new MockResponse(
      function () {
        done = true;
      });
    
    FileHandler.request(request, response);
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        var samplePath = path.join(__dirname, 'client', 'sample', 'secret.txt');
        var secret = fs.readFileSync(samplePath, 'utf8');
        test.assertEqual(secret, response.message);
      });
    
  }

});
