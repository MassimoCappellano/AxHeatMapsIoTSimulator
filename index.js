'use strict'

const mqtt = require('mqtt');
const fs = require('fs');
const Random = require('random-js');
const env = require('env2')('./.env');

const geoMapParser = require('./geomap_parser');

// your app goes here
console.log("HOST_MQTT_SERVER:", process.env.HOST_MQTT_SERVER); 
console.log("QUEUE_NAME:", process.env.QUEUE_NAME); 

var hostMqttServer = process.env.HOST_MQTT_SERVER;
var queueName = process.env.QUEUE_NAME;

var client = mqtt.connect('mqtt://' + hostMqttServer);

var doRun = true;
var timerDoWork = null;
const intervalSeconds = 6;
const intervalOnShutdown = 30;

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
   
   lights.forEach(function(light){
    
    if(lMsg == null)
        lMsg = "";

    var macAddress = light.macAddress; 
    var dimmer = light.dimmer;  
    lMsg += `#.#NMEAS;MAC${macAddress};IDN56;FWV0036;HMS18:09:00;DOY01;MTY2;PAR00158D00011B9CAE;LQI78;PKS0;PKR0;PKL0;VAC0;IAC0;PAT0;PRE0;CEA255;CER5;PW0900;PW1${dimmer};PW2900;TMP29;VCC3214;AD01;AD11;AD22;AD320;MOS4;#!#`;
   }, this);
   
   return lMsg;
}

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('SIGINT', () => {
    rl.question('Are you sure you want to exit? ', (answer) => {
      if (answer.match(/^y(es)?$/i)) {
          doRun = false;
          rl.pause();

          if(timerDoWork) {
              console.log("STOPPING DO WORK!!! WAIT:", intervalOnShutdown, "secs");
              setInterval(function() {
                  console.log("NOW CALLING CLEAR INTERVAL!!!");
                  clearInterval(timerDoWork);
                  process.exit(0); 
                }, intervalOnShutdown * 1000);
          }
      }

    });
  });

function buildAction(arrLights) {

    var topologyLights = arrLights;
    var numCall = 0;
    var msg;

    function doAction() {
        
        numCall++;

        if(doRun) {

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
    
            // console.log(slicedTopologyLightsCopy, slicedTopologyLightsCopy.length);
    
            modifyDimmer(slicedTopologyLightsCopy);

            if(slicedTopologyLightsCopy.length != 0) {
                console.log("SENDING NEW UPDATE MSG!!!");
                var newMsg = createMsgDimmer(slicedTopologyLightsCopy);
                msg = newMsg;
                
                // doing dump actual situations
                var stream = fs.createWriteStream("./out/dump_lights.json");
                            
                stream.once('open', function(fd) {
                    stream.write(JSON.stringify(topologyLights));
                    stream.end();
                });
                
                
                        
                client.publish(queueName, msg);
                
            }
            
        } else {
            console.log("STOPPING APPLICATION!!!");

            // sending the same message
            console.log("RESENDING LAST MSG!!!");

            client.publish( queueName, msg);
        }

        
    }

    return doAction;
};



console.log("WAIT SENDING", intervalSeconds,"seconds");

geoMapParser.doLoadFile("./out/Geomap.txt").then(function(result){
    // console.log("result:", result);
    var arrLight = geoMapParser.doSplitData(result);
    // console.log(arrLight);

    var fDoAction = buildAction(arrLight);
    fDoAction();
    timerDoWork = setInterval(fDoAction,  intervalSeconds * 1000);
}, function(err) { 
    console.error('ERROR:', err);
});



// client.end()