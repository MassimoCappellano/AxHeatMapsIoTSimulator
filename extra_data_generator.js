'use strict'

function buildExtra(fromNum, upToNum) {
    var results = [];

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
    
    for(var index = 0; (fromNum + index) <= upToNum; index ++) {

        results.push({ id: "ID" + (fromNum + index), 
            lightName: "Lamp " + (fromNum + index + 1), 
            macAddress: "11900Z000" + (fromNum + index).toString().padStart(7, "B"), lat: 0.1111111111, 
            lng: 0.2222222222, misc: 1, dimmer: null });

    }
    
    return results;

}



 module.exports = {
    buildExtra: buildExtra
 }