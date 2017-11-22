'use strict'




function createTopology(numLights) {

    if (!String.prototype.padStart) {
        String.prototype.padStart = function padStart(targetLength,padString) {
            targetLength = targetLength>>0; //floor if number or convert non-number to 0;
            padString = String(padString || ' ');
            if (this.length > targetLength) {
                return String(this);
            }
            else {
                targetLength = targetLength-this.length;
                if (targetLength > padString.length) {
                    padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
                }
                return padString.slice(0,targetLength) + String(this);
            }
        };
    }

    var index;
    var stTopology = '';
    for(index = 0; index < numLights; index++) {
        let idLight = index.toString().padStart(3, "0");
        let partMac = index.toString().padStart(7, "A");
        let rCoordLat = Math.random().toFixed(10);
        let rCoordLng = Math.random().toFixed(10);

        stTopology = stTopology + `ID${idLight};Lamp ${index +1};00158D000${partMac};${rCoordLat};${rCoordLng};0|`
    }

    return stTopology;

}

module.exports = createTopology;

