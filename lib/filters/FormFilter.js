var formidable = require('formidable'),
    fs = require('fs'),
    log4js = require('log4js');
    
var logger = log4js.getLogger('crossweb');

var FormFilter = {
  
  /**
   * Parse request and construct key-value attribute on request.
   *
   * @param {Object} request, HTTP request
   * @param {Function(error, Boolean)} callback
   */
  check: function (request, callback) {
    
    var form = new formidable.IncomingForm();
    form.parse(request, function (error, fields, files) {
      
      request.data = fields;
      request.data.files = files;
      
      callback(null, true);
      
    });
    
  },
  
  /**
   * It's never fail. 
   */
  fail: function (request, response) {
    response.writeHead(302, { 'Location': '/' });
  }
  
};

exports.FormFilter = FormFilter;