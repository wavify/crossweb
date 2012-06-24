var ObjectRender = require('../../../lib/render').ObjectRender;

var Sample = function (argument) {
  this.argument = argument;
}

Sample.prototype.get = function (input, callback) {
  callback(new ObjectRender({ action: true, message: 'success' }));
}

Sample.prototype.post = function (input, callback) {
  callback(new ObjectRender({ action: true, message: 'hello' }));
}

exports.Sample = Sample;
exports.setup = function (configPath, callback) {
  callback (new Sample('sample'));
}