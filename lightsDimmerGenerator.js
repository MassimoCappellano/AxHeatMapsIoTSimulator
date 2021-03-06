'use strict'

const mqtt = require('mqtt');
const fs = require('fs');
const Random = require('random-js');
const env = require('env2')('./.env');
const moment = require('moment');

const geoMapParser = require('./geomap_parser');
const extraDataGenerator = require('./extra_data_generator');

const DEFAULT_INTERVAL_SENDING_MSG = 6;

if(!process.env.QUEUE_NAME) {
    console.log("ERRORE CONFIGURAZIONE: manca valore parametro QUEUE_NAME nel file .env");
    process.exit(1); 
}

// your app goes here
console.log("HOST_MQTT_SERVER:", process.env.HOST_MQTT_SERVER || 'localhost'); 
console.log("QUEUE_NAME:", process.env.QUEUE_NAME); 

var pathInputGeomap = process.env.PATH_INPUT_GEOMAP || "./out/Geomap.txt";
var pathOutputDumpLights = process.env.PATH_OUTPUT_DUMP_LIGHTS || "./out/dump_lights.json";

var intervalSendingMsg = 
    process.env.INTERVAL_SENDING_MSG || DEFAULT_INTERVAL_SENDING_MSG;

var hostMqttServer = process.env.HOST_MQTT_SERVER  || 'localhost';
var queueName = process.env.QUEUE_NAME;

var doExtraLightsValue = process.env.DO_EXTRA_LIGHTS || 'ON';

if((typeof intervalSendingMsg) === 'string' && isNaN(intervalSendingMsg = parseInt(intervalSendingMsg, 10))) {
    console.log("VALUE INTERVAL_SENDING_MSG non numero,  settato a default:",
      DEFAULT_INTERVAL_SENDING_MSG);
    intervalSendingMsg = DEFAULT_INTERVAL_SENDING_MSG;
} 

var doExtraLights = true;

if(doExtraLightsValue == 'Off' || doExtraLightsValue == 'OFF'|| doExtraLightsValue == 'off') {
    doExtraLights = false;
} 

console.log("VALUE DO_EXTRA_LIGHTS:", (doExtraLights? 'ON': 'OFF'));

var client = mqtt.connect('mqtt://' + hostMqttServer);

var doRun = true;
var timerDoWork = null;

// create a Mersenne Twister-19937 that is auto-seeded based on time and other random values
var engine = Random.engines.mt19937().autoSeed();
var distributionDIMMER = Random.integer(0, 900);

function generateDIMMER() {
    return distributionDIMMER(engine);
}

function modifyDimmer(lights) {
 
    lights.forEach(function(light){
     
     var macAddress = light.macAddress; 
     var dimmer = generateDIMMER();  
     light.dimmer = dimmer;
     }, this);
    
}
 

function createMsgDimmer(lights) {
   var lMsg = null;
   var dataRilevazione = moment().format('HH:mm:ss');
   lights.forEach(function(light){
    
    if(lMsg == null)
        lMsg = "";

    var macAddress = light.macAddress; 
    var dimmer = light.dimmer;  
    lMsg += `#.#NMEAS;MAC${macAddress};IDN56;FWV0036;HMS290018${dataRilevazione};DOY01;MTY2;PAR00158D00011B9CAE;LQI78;PKS0;PKR0;PKL0;VAC0;IAC0;PAT0;PRE0;CEA255;CER5;PW0900;PW1${dimmer};PW2900;TMP29;VCC3214;AD01;AD11;AD22;AD320;MOS4;#!#|`;
   }, this);
   
   return lMsg;
}

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('SIGINT', () => {
    
    doRun = false;
    rl.pause();

    if(timerDoWork) {
        console.log("STOPPING DO WORK!!!");
        clearInterval(timerDoWork);
        process.exit(0); 
    }

  });

function buildAction(arrLights, doExtraLights) {

    var topologyLights = arrLights;
    var numCall = 0;
    var msg;

    var extraLights = [];

    if(doExtraLights) {
        extraLights = extraDataGenerator.buildExtra(300, 500);
    }
    
    var lengthArray = topologyLights.length;
    
    // create a distribution that will consistently produce integers within inclusive range [0, 99].
    var distribution = Random.integer(0, lengthArray -1);
    // generate a number that is guaranteed to be within [0, 99] without any particular bias.
    function generateNaturalLessThanX() {
        return distribution(engine);
    }

    function doAction() {
        
        numCall++;

        if(doRun) {

            var topologyLightsCopy = [];

            topologyLights.forEach(function(element) {
                topologyLightsCopy.push(element);
            }, this);
    
            Random.shuffle(engine, topologyLightsCopy); 
    
            var slicedTopologyLightsCopy = topologyLightsCopy.slice(0, generateNaturalLessThanX());
    
            // console.log(slicedTopologyLightsCopy, slicedTopologyLightsCopy.length);
            
            Random.shuffle(engine, extraLights);

            extraLights.forEach(function(element) {
                slicedTopologyLightsCopy.push(element);
            });
 
            Random.shuffle(engine, slicedTopologyLightsCopy); 

            modifyDimmer(slicedTopologyLightsCopy);

            if(slicedTopologyLightsCopy.length != 0) {
                console.log("---> SENDING NEW UPDATE MSG!!!", moment().format());
                var newMsg = createMsgDimmer(slicedTopologyLightsCopy);
                msg = newMsg;
                
                // doing dump actual situations
                var stream = fs.createWriteStream(pathOutputDumpLights);
                            
                stream.once('open', function(fd) {
                    stream.write(JSON.stringify(topologyLights));
                    stream.end();
                });
                                       
                client.publish(queueName, msg, { qos: 2 });
                
            }
            
        } else {

            // sending the same message
            // console.log("---> RESENDING LAST MSG!!!");

            // client.publish( queueName, msg);
        }

        
    }

    return doAction;
};



console.log("WAIT SENDING", intervalSendingMsg, "seconds");

geoMapParser.doLoadFile(pathInputGeomap).then(function(result){
    // console.log("result:", result);
    var arrLight = geoMapParser.doSplitData(result);
    // console.log(arrLight);

    var fDoAction = buildAction(arrLight, doExtraLights);
    fDoAction();

    // setInterval(()=> {  process.exit(0); }, 3000);
   
    timerDoWork = setInterval(fDoAction,  intervalSendingMsg * 1000);
}, function(err) { 
    console.error('ERROR:', err);
});



// client.end()
