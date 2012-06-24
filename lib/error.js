var FrameworkError = function (message, domain, code, reference) {
  Error.captureStackTrace(this, FrameworkError);

  this.name = 'FrameworkError';
  this.message = message;
  this.domain = domain;
  this.code = code;
  this.reference = reference;
  
}

var ErrorCode = {
  AUTHENTICATE_INVALID_TYPE: 1000,
  
  AUTHENTICATE_NO_USER: 1010,
  AUTHENTICATE_WRONG_PASSWORD: 1011,
  
  SESSION_INVALID: 1200,
    
  MODULE_NOT_INITIALIZE: 1100
};

var ErrorDomain = {
  FRAMEWORK: 1000
}

exports.FrameworkError = FrameworkError;
exports.ErrorCode = ErrorCode;
exports.ErrorDomain = ErrorDomain;