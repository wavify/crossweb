var TestIt = require('test_it');

var Security = require('../lib/modules/guard.js')._Security;

TestIt('TestGuard', {
  
  'before each': function (test) {
    test.security = new Security('aes256', '5F4DCC3B5AA765D61D8327DEB882CF992B95990A9151374ABD8FF8C5A7A0FE08', 'B7B4372CDFBCB3D16A2631B59B509E94');
  },
  
  'test encrypt/decrypt data': function (test) {
    var security = test.security;
    
    var crypted = security.encrypt('Hello, world');
    var plain = security.decrypt(crypted);
    
    test.assertEqual('Hello, world', plain);
    
  }
  
});
