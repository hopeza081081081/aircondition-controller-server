/**
 * Configuration Loader
 * Centralized configuration management
 */

const fs = require('fs');
const path = require('path');
const mqttConfig = require('./mqtt.config');
const appConfig = require('./app.config');
const Logger = require('../utils/Logger');

// Load JSON configuration files
const deviceDataModelPath = path.join(__dirname, '../../config/deviceDataModel.json');
const mqttSubConfigPath = path.join(__dirname, '../../config/mqttSubConfig.json');

let deviceDataModel;
let mqttSubscriptions;

try {
  deviceDataModel = JSON.parse(fs.readFileSync(deviceDataModelPath, 'utf8'));
  Logger.info('Device data model loaded successfully');
} catch (error) {
  Logger.error('Failed to load deviceDataModel.json', error);
  throw error;
}

try {
  mqttSubscriptions = JSON.parse(fs.readFileSync(mqttSubConfigPath, 'utf8'));
  console.log(`mqttSubConfigPath: ${mqttSubConfigPath}`);
  Logger.info('MQTT subscriptions loaded successfully');
} catch (error) {
  Logger.error('Failed to load mqttSubConfig.json', error);
  throw error;
}

// Export aggregated configuration
module.exports = {
  mqtt: mqttConfig,
  app: appConfig,
  subscriptions: mqttSubscriptions,
  deviceDataModel: deviceDataModel
};
