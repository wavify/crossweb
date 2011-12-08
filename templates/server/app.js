var path = require('path');

var Crossweb = require('crossweb').Crossweb;

var configPath = path.join(__dirname, 'config.json');
if (!path.existsSync(configPath)) {
  configPath = path.join(__dirname, 'config-default.json');
}

var process = new Crossweb(configPath);
process.run();