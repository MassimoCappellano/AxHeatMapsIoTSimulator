'use strict'

const fs = require('fs');
const env = require('env2')('./.env');
const f1 = require('./topologyLights');

console.log("NUM_LIGHTS:", process.env.NUM_LIGHTS); 
console.log("PATH_OUTPUT_GEOMAP:", process.env.PATH_OUTPUT_GEOMAP); 

var pathOutputGeomap = process.env.PATH_OUTPUT_GEOMAP || "./out/Geomap_out.txt";
var numLights = process.env.NUM_LIGHTS || 100;

if(isNaN(numLights = parseInt(numLights, 10))) {
  numLights = 100;
} 

var strTopology = f1(numLights);

var stream = fs.createWriteStream(pathOutputGeomap);

stream.once('open', function(fd) {
  stream.write(strTopology);
  stream.end();
});

console.log("FILE TOPOLOGY CREATED!!!");
