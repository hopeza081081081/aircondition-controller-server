/**
 * Configuration Loader
 * Centralized configuration management
 */

import * as fs from 'fs';
import * as path from 'path';
import { AppConfig } from '../types';
const Logger = require('../utils/Logger');
import mqttConfig from './mqtt.config';
import appConfig from './app.config';

// Load JSON configuration files
const deviceDataModelPath = path.join(__dirname, '../../config/deviceDataModel.json');
const mqttSubConfigPath = path.join(__dirname, '../../config/mqttSubConfig.json');

let deviceDataModel: AppConfig['deviceDataModel'];
let mqttSubscriptions: any;

try {
  deviceDataModel = JSON.parse(fs.readFileSync(deviceDataModelPath, 'utf8')) as AppConfig['deviceDataModel'];
  Logger.info('Device data model loaded successfully');
} catch (error) {
  Logger.error('Failed to load deviceDataModel.json', error as Error);
  throw error;
}

try {
  mqttSubscriptions = JSON.parse(fs.readFileSync(mqttSubConfigPath, 'utf8'));
  Logger.info('MQTT subscriptions loaded successfully', { path: mqttSubConfigPath });
} catch (error) {
  Logger.error('Failed to load mqttSubConfig.json', error as Error);
  throw error;
}

// Export aggregated configuration
const config: AppConfig = {
  mqtt: mqttConfig,
  app: appConfig,
  subscriptions: mqttSubscriptions,
  deviceDataModel: deviceDataModel
};

export default config;
