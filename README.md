# AxHeatMapsIoTSimulator

`node ./createTopology.js`

programma per creazione di file formato Geomap.

Esempio formato file Geomap:

`ID000;GW HeatMap;00158D00019A5E07;0.0034936043;0.0045115078;0|ID001;Lamp 1;00158D00010A4C57;0.0032502170;0.0043601978;1|ID002;Lamp 2;00158D00010A4C47;0.0034158439;0.0043624436;1|ID003;Lamp 3;00158D00010A48EC;0.0035820322;0.0043607593;1|ID004;Lamp 4;00158D00010A4C67;0.0037889254;0.0043610400;1|`

### Configirazione

Creare un file `.env` basandosi sul file `.env_template`

`NUM_LIGHTS` e `PATH_OUTPUT_GEOMAP`

| **PARAMETRO**      | **DESCRIZIONE**           | **DEFAULT**  |
| ------------- |-------------| -----|
| `NUM_LIGHTS`      | numero di luci per cui viene generato il file Geomap. Valore massimo 150, | `100` |
| `PATH_OUTPUT_GEOMAP`      | path di output file Geomap      |   `./out/Geomap_out.txt` |

## TRAFFIC GENERATOR

`node ./index.js`

Legge il file Geomap e simula dei dati sul dimmer luci inviandoli su coda MQTT.  

Sotto `./out/dump_lights.json` il dump della situazione lampade aggiornato in base ai dati generati.

### CONFIGURAZIONE

Creare un file `.env` basandosi sul file `.env_template`

**TODO** DESCRIZIONE VARIABILI DI CONFIGURAZIONE e AGGIUNTA `INTERVAL_SENDING_MSG` e `INTERVAL_ON_SHUTDOWN`