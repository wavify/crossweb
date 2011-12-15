var crypto = require('crypto'),
    fs = require('fs'),
    log4js = require('log4js'),
    url = require('url');

var Router = require('../router.js').Router;
var CPError = require('common').CPError;
var FrameworkError = require('../error.js').FrameworkError;

var logger = log4js.getLogger('crossweb');

var _instance = null;

/**
 * Resource guard
 *
 * @param {String} configPath, configuration file path
 */
var Guard = function (configPath) {
  var configObject = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  var guardConfig = configObject.guard;
  
  if (guardConfig.authenticator) {
    // External authenticator must exports Authenticator variable
    var Authenticator = require(guardConfig.authenticator).Authenticator;
    
    // External authenticator may accept one argument which is configuration.
    this._authenticator = new Authenticator(guardConfig);
  } else {
    this._authenticator = new _Authenticator(guardConfig.users);
  }
  
  var methods = {};
  var routeConfig = configObject.routes;
  for (var route in routeConfig) {
    if (Router.pattern.test(route)) {
      var fragments = route.split(':');
      
      var method = fragments[0].toLowerCase();
      var path = fragments[1];
      
      var fillMethod = function (method, path, allows) {
        if (!methods[method]) {
          methods[method] = {};
        }
        
        methods[method][path] = {};
        for (var key in allows) {
          var allow = allows[key];
          methods[method][path][allow] = true;
        }
        
        methods[method][path].length = allows ? allows.length : 0;
      };
      
      if (method === '*') {
        for (var index in Router.defaultMethods) {
          fillMethod(Router.defaultMethods[index], path, routeConfig[route].allow);
        }
      } else {
        fillMethod(method, path, routeConfig[route].allow);
      }
      
    } 
  }
  
  this.methods = methods;
}

/**
 * Authenticate with credential
 *
 * @param {Object} credential
 * @param {Function(error, output)} callback, authenticate result
 */
Guard.prototype.authenticate = function (credential, callback) {
  var authenticator = this._authenticator;
  authenticator.authenticate(credential, callback);
}

/**
 * Check authorize user on resource
 *
 * @param {Object} resource, method and path object
 * @param {Object} user, user object from authenticate method
 * @param {Function(error, output)} callback, callback function
 */
Guard.prototype.authorize = function (resource, user, callback) {
  
  var methods = this.methods;
  
  var method = resource.method.toLowerCase();
  var path = resource.path;
  
  if (methods[method] && methods[method][path]) {
    var permission = methods[method][path];

    if (permission.length == 0) {
      // Everyone can get here
      callback(null, true);
    } else {
      if (user) {
        var pass = false;
        var roles = user.roles || {};

        for (var index in roles) {
          var role = roles[index];
          if (permission[role] && role != 'length') {
            pass = true;
            break;
          }
        }

        if (pass) {
          callback(null, true);
        } else {
          callback(null, false);
        }

      } else {
        // Anonymous is not allow here
        callback(null, false);
      }
    }
  } else {
    // Not found method or path, pass it through handler.
    callback (null, true);
  }
  
}

/**
 * Security util for encrypt or decrypt data. 
 * Key and IV should come from openssl below command
 *
 * $openssl enc -method -k password -nosalt -P
 *
 * result from this command will use in client side too.
 *
 * @param {String} method, encryption method e.g. aes256
 * @param {String} key, Key hex string generate from openssl
 * @param {String} iv, Initialization vector hex string generate from openssl
 */
var Security = function (method, key, iv) {
  this.method = method;
  try {
    this.key = new Buffer(Security.hexToBytes(key)).toString('binary');
    this.iv = new Buffer(Security.hexToBytes(iv)).toString('binary');
  } catch (e) {
    logger.debug (e);
    logger.error ('Invalid key and iv');
    this.key = '';
    this.iv = '';
  }
  
}

/**
 * Convert hex string to bytes array.
 *
 * @param {String} hex, hex string
 *
 * @return {Array(Number)} list of character code
 */
Security.hexToBytes = function (hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
		bytes.push(parseInt(hex.substr(c, 2), 16));
	return bytes;
}

/**
 * Encrypt string data
 *
 * @param {String} data, plain data want to encrypt.
 * 
 * @return {String} base64 crypted string or plain data when error
 */
Security.prototype.encrypt = function (data) {
  var output = '';
  try {
    var cipher = crypto.createCipheriv(this.method, this.key, this.iv);
    var crypted = cipher.update(data, 'utf8', 'base64');
    crypted += cipher.final('base64');
    
    output = crypted;
  } catch (e) {
    logger.debug (e);
    logger.error ('Can\'t encrypt data');
    output = data;
  }
  
  return output;
}

/**
 * Decrypt data
 *
 * @param {String} data, base64 crypted data
 *
 * @return {String} plain data
 */
Security.prototype.decrypt = function (data) {
  var output = '';
  try {
    var decipher = crypto.createDecipheriv(this.method, this.key, this.iv);
    var plain = decipher.update(data, 'base64', 'utf8');
    plain += decipher.final('utf8');
    
    output += plain;
  } catch (e) {
    logger.debug (e);
    logger.error ('Can\' decrypt data');
    output = data;
  }
  
  return output;
}

/**
 * Simple authenticator use user list from configuration file.
 *
 * @param {Object} users, key is username which use password and role as value
 */
var _Authenticator = function (users) {
  this.users = users;
}

/**
 * Authenticate user with plain credential (support only plain)
 *
 * @param {Object} credential, Username and Password credential
 * @param {Function(error, username)} callback, function return
 *        error and username after authenticate.
 */
_Authenticator.prototype.authenticate = 
  function (credential, callback) {
    callback = callback || function () {};
  
    var users = this.users;
  
    if (credential.type == 'plain') {
    
      var username = credential.username;
      var password = credential.password;
    
      var found = users[username];
      if (found) {
        if (found.password == password) {
          callback(null, { username: username, roles: found.roles });
        } else {
          callback(new CPError(
            'Invalid password',
            CPError.domain.WEB,
            FrameworkError.AUTHENTICATE_WRONG_PASSWORD,
            credential));
        }
      } else {
        callback(new CPError(
          'No user found',
          CPError.domain.WEB,
          FrameworkError.AUTHENTICATE_NO_USER,
          credential));
      }
    
    } else {
      callback(new CPError(
        'Invalid authentication type', 
        CPError.domain.WEB,
        FrameworkError.AUTHENTICATE_INVALID_TYPE,
        credential));
    }
  }

/**
 * Guard resource constructor.
 *
 * @param {String} method, HTTP Method
 * @param {String} path, HTTP request path
 */
var Resource = function (method, path) {
  this.method = method;
  this.path = path;
}

/**
 * Get Guard resource from HTTP request
 *
 * @param {Object} request, HTTP Request
 * @return {Object} resource for use in guard
 */
Resource.fromRequest = function (request) {
  var method = request.method;
  var path = url.parse(request.url).pathname;
  
  var output = new Resource(method, path);
  return output;
}

/**
 * Get guard instance
 *
 * @param {String} configPath, configuration path
 *
 * @return {Object} guard instance
 */
exports.instance = function (configPath) {
  if (!_instance) {
    _instance = new Guard(configPath);
  }
  
  return _instance;
};

exports.Guard = Guard;
exports.Resource = Resource;
exports.Security = Security;