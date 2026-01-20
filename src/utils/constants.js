/**
 * Application Constants
 */

const TOPICS = {
  RPI1_OBJ_DETECTOR: 'myFinalProject/rpi1/objDetector',
  RPI1_ONLINE: 'myFinalProject/rpi1/onlineStatus/online',
  RPI2_OBJ_DETECTOR: 'myFinalProject/rpi2/objDetector',
  RPI2_ONLINE: 'myFinalProject/rpi2/onlineStatus/online',
  AIRCON1_MEASURE: 'myFinalProject/airconController1/measure',
  AIRCON1_PROPERTIES: 'myFinalProject/airconController1/properties',
  AIRCON2_MEASURE: 'myFinalProject/airconController2/measure',
  AIRCON2_PROPERTIES: 'myFinalProject/airconController2/properties',
  AIRCON3_MEASURE: 'myFinalProject/airconController3/measure',
  AIRCON3_PROPERTIES: 'myFinalProject/airconController3/properties',
  SERVER_ONLINE: 'myFinalProject/server/properties/online'
};

const COMMANDS = {
  ON: 'true',
  OFF: 'false'
};

module.exports = {
  TOPICS,
  COMMANDS
};
