'use strict'

const fs = require('fs');
const env = require('env2')('./.env');
const topologyLights = require('./topologyLights');

const DEFAULT_NUM_LIGHTS = 100;
const DEFAULT_PATH_OUTPUT_GEOMAP = "./out/Geomap_out.txt";

console.log("NUM_LIGHTS:", process.env.NUM_LIGHTS); 
console.log("PATH_OUTPUT_GEOMAP:", process.env.PATH_OUTPUT_GEOMAP); 

var pathOutputGeomap = process.env.PATH_OUTPUT_GEOMAP || DEFAULT_PATH_OUTPUT_GEOMAP;
var numLights = process.env.NUM_LIGHTS || DEFAULT_NUM_LIGHTS;

if((typeof numLights) === 'string' && isNaN(numLights = parseInt(numLights, 10))) {
  console.log("VALUE NUM_LIGHTS non numero,  settato a default:",
    DEFAULT_NUM_LIGHTS);
  numLights = DEFAULT_NUM_LIGHTS;
} 

if(numLights > 150) {
  console.log("NUM_LIGHTS >", 150, 
    "settato a default:", DEFAULT_NUM_LIGHTS);
  numLights = DEFAULT_NUM_LIGHTS;
}

var strTopology = topologyLights(numLights);

var stream = fs.createWriteStream(pathOutputGeomap);

stream.once('open', function(fd) {
  stream.write(strTopology);
  stream.end();
});

console.log("FILE TOPOLOGY CREATED!!!");
