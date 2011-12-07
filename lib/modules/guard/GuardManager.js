var log4js = require('log4js');

var GuardManager = function (configPath) {
  
}

/**
 * for authorization
 * @param {String} path
 * @param {String} username
 * @param {Function(err, {Boolean}result)} callback
 */
GuardManager.prototype.allow = function(path, username, callback){
}

/**
 * authenticate
 * @param {Object} credential
 * @param {Function(err, result)} callback
 */
GuardManager.prototype.authenticate = function(credential, callback){
}

GuardManager.prototype.verify = function(username, userSession, callback){
}

exports.GuardManager = GuardManager;