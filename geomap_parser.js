'use strict'

const fs = require('fs');
const Promise = require("bluebird");

function doSplitData(data) {
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

function doLoadFile(geomapFilename) {
    var promise = new Promise(function(resolve, reject){

        fs.readFile(geomapFilename, 'utf8', function (err, data) {
            if (err) {
              return reject(err);
            }

            resolve(data);
          });


    });
    

      return promise;
    }

module.exports = {
    doLoadFile: doLoadFile,
    doSplitData: doSplitData
}