var _store = {
  called: false,
  setup: function (configPath, callback) {
    callback = callback || function () {};
    
    _store.called = true;
    callback();
  }
}

exports.store = _store;
exports.setup = _store.setup;