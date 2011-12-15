var path = require('path');
var TestIt = require('test_it');

var FormFilter = require('../lib/filters/FormFilter').FormFilter;

var MockRequest = require('./MockRequestResponse.js').MockRequest;
var MockResponse = require('./MockRequestResponse.js').MockResponse;

var timeout = 1000;

TestIt('TestFormFilter', {
  
  'before all': function (test) {
    FormFilter.setup(path.join(__dirname, 'MockConfig.json'));
  },
  
  'test get request with key value format': function (test) {
    var done = false;
    
    var request = new MockRequest('GET', '/sample?key=test&message=hello');
    FormFilter.check(request, function () {
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(request.body, 'Request should have body after pass FormFilter');
        test.assert(request.body.key, 'Body should have key');
        test.assert(request.body.message, 'Body should have message');
        
        test.assertEqual('test', request.body.key,
          'Key property should have value test');
        test.assertEqual('hello', request.body.message,
          'Message property should have value hello');
      });
    
  },
  
  'test get request without key value format': function (test) {
    var done = false;
    
    var request = new MockRequest('GET', '/sample?helloworld');
    FormFilter.check(request, function () {
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(request.body, 'Request should have body after pass FormFilter');
        test.assert(request.body._, 'Body should have _ attribute');
        test.assertEqual(1, request.body._.length);
        test.assertEqual(request.body._[0], 'helloworld');
      });
  },
  
  'test get request without key value format and multivalue': function (test) {
    var done = false;
    
    var request = new MockRequest('GET', '/sample?helloworld&thisisabird');
    FormFilter.check(request, function () {
      done = true;
    });
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(request.body, 'Request should have body after pass FormFilter');
        test.assert(request.body._, 'Body should have _ attribute');
        test.assertEqual(request.body._.length, 2);
        test.assertEqual(request.body._[0], 'helloworld');
        test.assertEqual(request.body._[1], 'thisisabird');
      });
  },
  
  'test post with json': function (test) {
    var done = false;
    
    var request = new MockRequest('POST', '/sample', {
      'content-type': 'application/json'
    });
    FormFilter.check(request, function () {
      done = true;
    });
    
    var object = {
      key: '001',
      message: 'hello, world',
      children: [
        { name: 'book' },
        { name: 'top' }
      ]
    };
    
    request.write(JSON.stringify(object));
    request.end();
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(request.body, 'Request should have body after pass FormFilter');
        test.assert(request.body.key, 'Request should have key attribute');
        test.assert(request.body.message, 'Request should have message attribute');
        test.assert(request.body.children, 'Request should have children attribute');
        
        test.assertEqual('001', request.body.key, 'Key value should be "001"');
        test.assertEqual('hello, world', request.body.message, 
          'Message value should be "hello, world"');
        test.assertEqual(2, request.body.children.length, 
          'Children property should be array and have 2 members');
      });
  },
  
  'test post with json and encoding': function (test) {
    var done = false;
    
    var request = new MockRequest('POST', '/sample', {
      'content-type': 'application/json; charset=utf8'
    });
    FormFilter.check(request, function () {
      done = true;
    });
    
    var object = {
      key: '001',
      message: 'hello, world',
      children: [
        { name: 'book' },
        { name: 'top' }
      ]
    };
    
    request.write(JSON.stringify(object));
    request.end();
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(request.body, 'Request should have body after pass FormFilter');
        test.assert(request.body.key, 'Request should have key attribute');
        test.assert(request.body.message, 'Request should have message attribute');
        test.assert(request.body.children, 'Request should have children attribute');
        
        test.assertEqual('001', request.body.key, 'Key value should be "001"');
        test.assertEqual('hello, world', request.body.message, 
          'Message value should be "hello, world"');
        test.assertEqual(2, request.body.children.length, 
          'Children property should be array and have 2 members');
      });
  },
  
  'test post with json and encoding and query': function (test) {
    var done = false;
    
    var request = new MockRequest('POST', '/sample?book=1', {
      'content-type': 'application/json; charset=utf8'
    });
    FormFilter.check(request, function () {
      done = true;
    });
    
    var object = {
      key: '001',
      message: 'hello, world',
      children: [
        { name: 'book' },
        { name: 'top' }
      ]
    };
    
    request.write(JSON.stringify(object));
    request.end();
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(request.body, 'Request should have body after pass FormFilter');
        test.assert(request.body.book, 'Request should have book attribute');
        test.assert(request.body.key, 'Request should have key attribute');
        test.assert(request.body.message, 'Request should have message attribute');
        test.assert(request.body.children, 'Request should have children attribute');
        
        test.assertEqual('1', request.body.book, 'Book value should be "1"');
        test.assertEqual('001', request.body.key, 'Key value should be "001"');
        test.assertEqual('hello, world', request.body.message, 
          'Message value should be "hello, world"');
        test.assertEqual(2, request.body.children.length, 
          'Children property should be array and have 2 members');
      });
  },
  
  'test post with urlencoding': function (test) {
    var done = false;
    
    var request = new MockRequest('POST', '/sample', {
      'content-type': 'application/x-www-form-urlencoded'
    });
    FormFilter.check(request, function () {
      done = true;
    });
    
    var object = {
      key: '001',
      message: 'hello, world',
      children: [
        { name: 'book' },
        { name: 'top' }
      ]
    };
    
    request.write("key=001&message=hello,world");
    request.end();
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(request.body, 'Request should have body after pass FormFilter');
        test.assert(request.body.key, 'Request should have key attribute');
        test.assert(request.body.message, 'Request should have message attribute');
        
        test.assertEqual('001', request.body.key, 'Key value should be "001"');
        test.assertEqual('hello,world', request.body.message, 
          'Message value should be "hello, world"');
      });
  },
  
  'test post with urlencoding and query': function (test) {
    var done = false;
    
    var request = new MockRequest('POST', '/sample?book=1', {
      'content-type': 'application/x-www-form-urlencoded'
    });
    FormFilter.check(request, function () {
      done = true;
    });
    
    var object = {
      key: '001',
      message: 'hello, world',
      children: [
        { name: 'book' },
        { name: 'top' }
      ]
    };
    
    request.write("key=001&message=hello,world");
    request.end();
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(request.body, 'Request should have body after pass FormFilter');
        test.assert(request.body.book, 'Request should have book attribute');
        test.assert(request.body.key, 'Request should have key attribute');
        test.assert(request.body.message, 'Request should have message attribute');
        
        test.assertEqual('1', request.body.book, 'Key value should be "1"');
        test.assertEqual('001', request.body.key, 'Key value should be "001"');
        test.assertEqual('hello,world', request.body.message, 
          'Message value should be "hello, world"');
      });
  },
  
  'test post with urlencoding and query that duplicate': function (test) {
    var done = false;
    
    var request = new MockRequest('POST', '/sample?message=man', {
      'content-type': 'application/x-www-form-urlencoded'
    });
    FormFilter.check(request, function () {
      done = true;
    });
    
    var object = {
      key: '001',
      message: 'hello, world',
      children: [
        { name: 'book' },
        { name: 'top' }
      ]
    };
    
    request.write("key=001&message=hello,world");
    request.end();
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(request.body, 'Request should have body after pass FormFilter');
        test.assert(request.body.key, 'Request should have key attribute');
        test.assert(request.body.message, 'Request should have message attribute');
        
        test.assertEqual('001', request.body.key, 'Key value should be "001"');
        test.assertEqual('hello,world', request.body.message, 
          'Message value should be "hello, world"');
      });
  },
  
  'test post with multipart': function (test) {
    var done = false;
    
    var request = new MockRequest('POST', '/test', {
      'content-type': 'multipart/form-data; boundary=----boundary'
    });
    FormFilter.check(request, function () {
      done = true;
    });
    
    var multipartData = '------boundary\r\n' +
                        'Content-Disposition: form-data; name="key"\r\n' +
                        '\r\n' +
                        '001\r\n' +
                        '------boundary\r\n' +
                        'Content-Disposition: form-data; name="message"\r\n' +
                        '\r\n' +
                        'Hello, World\r\n' +
                        '------boundary\r\n' +
                        'Content-Disposition: form-data; name="file1"; filename="sample.txt"\r\n' +
                        'Content-Type: text/plain\r\n' +
                        '\r\n' +
                        'Hello, World\r\n' +
                        '------boundary\r\n' +
                        'Content-Disposition: form-data; name="file2"; filename="sample2.txt"\r\n' +
                        'Content-Type: text/plain\r\n' +
                        '\r\n' +
                        'Hello, World\r\n' +
                        '------boundary--\r\n';
    var multipartBuffer = new Buffer(multipartData);
    request.write(multipartBuffer);
    request.end();
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(request.body, 'Request should have body after pass FormFilter');
        test.assert(request.body.key, 'Request should have key attribute');
        test.assert(request.body.message, 'Request should have message attribute');
        test.assert(request.body.file1, 'Request should have file1 attribute');
        test.assert(request.body.file2, 'Request should have file1 attribute');
        
        test.assertEqual('001', request.body.key, 'Key value should be "001"');
        test.assertEqual('Hello, World', request.body.message, 
          'Message value should be "hello, world"');
      });
  },
  
  'test post with multipart and query': function (test) {
    var done = false;
    
    var request = new MockRequest('POST', '/test?book=1', {
      'content-type': 'multipart/form-data; boundary=----boundary'
    });
    FormFilter.check(request, function () {
      done = true;
    });
    
    var multipartData = '------boundary\r\n' +
                        'Content-Disposition: form-data; name="key"\r\n' +
                        '\r\n' +
                        '001\r\n' +
                        '------boundary\r\n' +
                        'Content-Disposition: form-data; name="message"\r\n' +
                        '\r\n' +
                        'Hello, World\r\n' +
                        '------boundary\r\n' +
                        'Content-Disposition: form-data; name="file1"; filename="sample.txt"\r\n' +
                        'Content-Type: text/plain\r\n' +
                        '\r\n' +
                        'Hello, World\r\n' +
                        '------boundary\r\n' +
                        'Content-Disposition: form-data; name="file2"; filename="sample2.txt"\r\n' +
                        'Content-Type: text/plain\r\n' +
                        '\r\n' +
                        'Hello, World\r\n' +
                        '------boundary--\r\n';
    var multipartBuffer = new Buffer(multipartData);
    request.write(multipartBuffer);
    request.end();
    
    test.waitFor(
      function (time) {
        return done || time > timeout;
      },
      function () {
        test.assert(request.body, 'Request should have body after pass FormFilter');
        test.assert(request.body.key, 'Request should have key attribute');
        test.assert(request.body.message, 'Request should have message attribute');
        test.assert(request.body.file1, 'Request should have file1 attribute');
        test.assert(request.body.file2, 'Request should have file1 attribute');
        test.assert(request.body.book, 'Request should have book attribute');
        
        test.assertEqual('1', request.body.book, 'Key value should be "1"');
        test.assertEqual('001', request.body.key, 'Key value should be "001"');
        test.assertEqual('Hello, World', request.body.message, 
          'Message value should be "hello, world"');
      });
  }
  
});