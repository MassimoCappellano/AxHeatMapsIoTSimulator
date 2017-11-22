'use strict'

const mqtt = require('mqtt');
const Random = require('random-js');
const env = require('env2')('./.env');

const geoMapParser = require('./geomap_parser');

// your app goes here
console.log("HOST_MQTT_SERVER:", process.env.HOST_MQTT_SERVER); 
console.log("QUEUE_NAME:", process.env.QUEUE_NAME); 

var hostMqttServer = process.env.HOST_MQTT_SERVER;
var queueName = process.env.QUEUE_NAME;

var client = mqtt.connect('mqtt://' + hostMqttServer);

var msg1 = '#.#NMEAS;MAC00158D00019A5E07;IDN56;FWV0036;HMS18:09:00;DOY01;MTY2;PAR00158D00011B9CAE;LQI78;PKS0;PKR0;PKL0;VAC0;IAC0;PAT0;PRE0;CEA255;CER5;PW0900;PW1900;PW2900;TMP29;VCC3214;AD01;AD11;AD22;AD320;MOS4;#!##.#NMEAS;MAC00158D00010A4C57;IDN70;FWV0036;HMS18:09:00;DOY01;MTY2;PAR00158D00011B138B;LQI150;PKS0;PKR0;PKL0;VAC0;IAC0;PAT0;PRE0;CEA255;CER4;PW0900;PW1900;PW2900;TMP29;VCC3183;AD01;AD11;AD21;AD3599;MOS1;#!##.#NMEAS;MAC00158D000109EDE4;IDN113;FWV0036;HMS18:09:00;DOY01;MTY2;PAR00158D00011B132B;LQI138;PKS0;PKR0;PKL0;VAC0;IAC0;PAT0;PRE0;CEA255;CER4;PW0900;PW1900;PW2900;TMP29;VCC3193;AD01;AD11;AD21;AD3599;MOS2;#!##.#NMEAS;MAC00158D000109EA5D;IDN48;FWV0036;HMS18:09:00;DOY01;MTY2;PAR00158D00011B1384;LQI45;PKS0;PKR0;PKL0;VAC0;IAC0;PAT0;PRE0;CEA255;CER3;PW0900;PW1900;PW2900;TMP29;VCC3180;AD02;AD12;AD22;AD320;MOS2;#!##.#NMEAS;MAC00158D00011B1327;IDN41;FWV0036;HMS18:09:00;DOY01;MTY2;PAR00158D00011B9C7D;LQI168;PKS0;PKR0;PKL0;VAC0;IAC0;PAT0;PRE0;CEA255;CER4;PW0900;PW1900;PW2900;TMP29;VCC3187;AD01;AD12;AD22;AD3599;MOS4;#!##.#NMEAS;MAC00158D00011B132B;IDN23;FWV0036;HMS18:09:00;DOY01;MTY2;PAR00158D000109EA5B;LQI171;PKS0;PKR0;PKL0;VAC0;IAC0;PAT0;PRE0;CEA255;CER4;PW0900;PW1900;PW2900;TMP29;VCC3180;AD01;AD11;AD21;AD318;MOS2;#!#';
var msg2 = '#.#NMEAS;MAC00158D00019A5E07;IDN56;FWV0036;HMS18:09:00;DOY01;MTY2;PAR00158D00011B9CAE;LQI78;PKS0;PKR0;PKL0;VAC0;IAC0;PAT0;PRE0;CEA255;CER5;PW0800;PW1800;PW2800;TMP29;VCC3214;AD01;AD11;AD22;AD320;MOS4;#!##.#NMEAS;MAC00158D00010A4C57;IDN70;FWV0036;HMS18:09:00;DOY01;MTY2;PAR00158D00011B138B;LQI150;PKS0;PKR0;PKL0;VAC0;IAC0;PAT0;PRE0;CEA255;CER4;PW0800;PW1800;PW2800;TMP29;VCC3183;AD01;AD11;AD21;AD3599;MOS1;#!##.#NMEAS;MAC00158D000109EDE4;IDN113;FWV0036;HMS18:09:00;DOY01;MTY2;PAR00158D00011B132B;LQI138;PKS0;PKR0;PKL0;VAC0;IAC0;PAT0;PRE0;CEA255;CER4;PW0900;PW1900;PW2900;TMP29;VCC3193;AD01;AD11;AD21;AD3599;MOS2;#!##.#NMEAS;MAC00158D000109EA5D;IDN48;FWV0036;HMS18:09:00;DOY01;MTY2;PAR00158D00011B1384;LQI45;PKS0;PKR0;PKL0;VAC0;IAC0;PAT0;PRE0;CEA255;CER3;PW0900;PW1900;PW2900;TMP29;VCC3180;AD02;AD12;AD22;AD320;MOS2;#!##.#NMEAS;MAC00158D00011B1327;IDN41;FWV0036;HMS18:09:00;DOY01;MTY2;PAR00158D00011B9C7D;LQI168;PKS0;PKR0;PKL0;VAC0;IAC0;PAT0;PRE0;CEA255;CER4;PW0900;PW1900;PW2900;TMP29;VCC3187;AD01;AD12;AD22;AD3599;MOS4;#!##.#NMEAS;MAC00158D00011B132B;IDN23;FWV0036;HMS18:09:00;DOY01;MTY2;PAR00158D000109EA5B;LQI171;PKS0;PKR0;PKL0;VAC0;IAC0;PAT0;PRE0;CEA255;CER4;PW0900;PW1900;PW2900;TMP29;VCC3180;AD01;AD11;AD21;AD318;MOS2;#!#';

// create a Mersenne Twister-19937 that is auto-seeded based on time and other random values
var engine = Random.engines.mt19937().autoSeed();


function buildAction(arrLights) {

    var topologyLights = arrLights;

    function doAction() {
        console.log("sending on queue");

        var topologyLightsCopy = [];
        topologyLights.forEach(function(element) {
            topologyLightsCopy.push(element);
        }, this);

        var lengthArray = topologyLights.length;

        // create a distribution that will consistently produce integers within inclusive range [0, 99].
        var distribution = Random.integer(0, lengthArray -1);
        // generate a number that is guaranteed to be within [0, 99] without any particular bias.
        function generateNaturalLessThanX() {
            return distribution(engine);
        }

        Random.shuffle(engine, topologyLightsCopy); 

        var slicedTopologyLightsCopy = topologyLightsCopy.slice(0, generateNaturalLessThanX());

        console.log(slicedTopologyLightsCopy, slicedTopologyLightsCopy.length);

        var rNum = Math.random();

        var msg;
        if(rNum > 0.5)
            msg = msg2;
        else
            msg = msg1;
    
        client.publish( queueName, msg);
    }

    return doAction;
};

const intervalSeconds = 6;

console.log("WAIT SENDING", intervalSeconds,"seconds");

geoMapParser.doLoadFile("./out/Geomap.txt").then(function(result){
    // console.log("result:", result);
    var arrLight = geoMapParser.doSplitData(result);
    console.log(arrLight);

    var fDoAction = buildAction(arrLight);
    fDoAction();
    setInterval(fDoAction,  intervalSeconds * 1000);
}, function(err) { 
    console.error('ERROR:', err);
});



// client.end()