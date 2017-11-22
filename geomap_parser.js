'use strict'

const fs = require('fs');
const Promise = require("bluebird");

function doSplitWork(data) {
    var results = [];
    var ligthsStr = data.split('|');

    ligthsStr.forEach(function(element) {
        console.log(element);

        var valuesLight = element.split(';');

        if(valuesLight.length == 6){
            // add element

            results.push({ id: valuesLight[0], lightName: valuesLight[1], 
                macAddress: valuesLight[2], lat: valuesLight[3], 
                lng: valuesLight[4], misc: valuesLight[5] });

        }
    }, this);

    return results;
}

function doParsing(geomapFilename) {
    fs.readFile(geomapFilename, 'utf8', function (err, data) {
        if (err) {
          return console.log(err);
        }
        var lightsData = doSplitWork(data);

        console.log(lightsData);
      });

    }

module.exports = doParsing;
