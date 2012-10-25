var fs = require('fs'),
    hogan = require('hogan.js'),
    log4js = require('log4js'),
    mime = require('mime'),
    path = require('path'),
    url = require('url'),
    util = require('util');
    
var logger = log4js.getLogger('crossweb');

var ObjectRender = function ObjectRender (object) {
  this.object = object;
}

ObjectRender.prototype.render = function (request, response, callback) {
  callback = callback || function () {};

  var object = this.object;
  if (object) {
    if (typeof(object) === 'string') {
      response.writeHead(200, {
        'Content-Type': 'text/plain'
      });
      response.write(object);
    }
    else {
      response.writeHead(200, {
        'Content-Type': 'application/json'
      });
      response.write(JSON.stringify(object));
    } 
  }
  
  response.end();
  callback();
}

var FileRender = function FileRender(file, filename) {
  this.file = file;
  this.filename = filename;
}

FileRender.prototype.render = function (request, response, callback) {
  callback = callback || function () {};

  var file = this.file;
  if (file && fs.existsSync(file)) {
    
    var stat = fs.statSync(file);
    if (stat.isDirectory()) {
      var resource = url.parse(request.url);
      response.writeHead(301, {
        'Location': url.resolve(resource.pathname, '/index.html')
      });
      
      response.end();
      callback();
    }
    else {
      var properties = {
        'Content-Length': stat.size,
        'Cache-Control': 'public, max-age=3600'
      };
      if (this.filename) {
        properties['Content-Type'] = mime.lookup(this.filename);
        properties['Content-Disposition'] = 'attachment; filename="' + this.filename + '"';
      }
      else {
        properties['Content-Type'] = mime.lookup(file);
      }
      
      response.writeHead(200, properties);
      
      var stream = fs.createReadStream(file);
      stream.on('data', function (data) {
        // Prevent node die from IE close connection.
        try {
          response.write(data);
        } catch (e) {
          logger.error(e);
        }
      });

      stream.on('end', function () {
        try {
          response.end();
        } catch (e) {
          logger.error (e);
        }
        
        callback();
      });
    }
    
  }
  else {
    response.writeHead(404, {
      'Content-Type': 'text/plain'
    });
    response.end();
    callback();
  }
}

var RedirectRender = function RedirectRender(url, type, object) {
  this.url = url;
  this.type = type || RedirectRender.PERMANENT;
  this.object = object;
}

RedirectRender.PERMANENT = 301;
RedirectRender.TEMPORARY = 302;

RedirectRender.prototype.render = function (request, response, callback) {
  callback = callback || function () {};
  
  var url = this.url;
  var type = this.type;
  
  if (url && type) {
    response.writeHead(type, {
      'Location': url,
      'Content-Type': 'application/json'
    });
  }
  else {
    response.writeHead(503, {});
  }
  
  var data = null;
  if (this.object) {
    data = JSON.stringify(this.object);
  }
  response.end(data);
  callback();
}

var NotFoundRender = function NotFoundRender(file) {
  this.file = file;
}

NotFoundRender.prototype.render = function (request, response, callback) {
  callback = callback || function () {};
  
  response.writeHead(404, {});
  if (this.file) {
    var file = this.file;
    var stream = fs.createReadStream(file);
    stream.on('data', function (data) {
      // Prevent node die from IE close connection.
      try {
        response.write(data);
      } catch (e) {
        logger.error(e);
      }
    });

    stream.on('end', function () {
      response.end();
      callback();
    });
  }
  else {
    response.end();
    callback();
  }
}

var HoganRender = function HoganRender(file, object) {
  this.file = file;
  this.object = object;
}

HoganRender.cache = {};

HoganRender.prototype.render = function (request, response, callback) {
  callback = callback || function () {};
  
  var file = this.file;
  var object = this.object;
  
  response.writeHead(200, {
    'Content-Type': 'text/html; charset=UTF-8'
  });
  if (file && fs.existsSync(file) && object && typeof(object) === 'object') {
    if (HoganRender.cache[file]) {
      var template = HoganRender.cache[file];
      var output = template.render(object);
      response.end(output);
    }
    else {
      var save = function (file, callback) {
        fs.readFile(file, 'utf8', function (error, data) {
          var template = hogan.compile(data);
          HoganRender.cache[file] = template;
          
          callback(template);
        });
      }
      
      fs.watch(file, function (event, filename) {
        save(file, function (template) {
          logger.debug ('Reload template');
        });
      });
      
      save(file, function (template) {
        var output = template.render(object);
        response.end(output);
        
        callback();
      });
      
    }
  }
  else {
    response.writeHead(503, {});
    response.end();
    callback();
  }
}

exports.FileRender = FileRender;
exports.HoganRender = HoganRender;
exports.NotFoundRender = NotFoundRender;
exports.ObjectRender = ObjectRender;
exports.RedirectRender = RedirectRender;