var fs = require ('fs'),
    path = require ('path');

var directories = fs.readdirSync('.');
var pattern = /^Test.+\.js$/;

for (var index in directories) {
  var file = directories[index];
  if (pattern.test(file)) {
    require (path.join(__dirname, file));
  }
}
