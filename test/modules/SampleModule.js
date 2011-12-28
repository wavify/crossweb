var isCall = false;

exports.setup = function (configPath, callback) {
  callback = callback || function () {};
  
  isCall = true;
  callback();
}

exports.isCall = isCall;