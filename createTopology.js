'use strict'
var fs = require('fs');
var f1 = require('./topologyLights');

var strTopology = f1(100);

console.log(strTopology);

var stream = fs.createWriteStream("./out/Geomap.txt");

stream.once('open', function(fd) {
  stream.write(strTopology);
  stream.end();
});
