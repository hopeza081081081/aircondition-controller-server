"use strict";
/**
 * Configuration Loader
 * Centralized configuration management
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.airconControllerConfig = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Logger = require('../utils/Logger');
const mqtt_config_1 = __importDefault(require("./mqtt.config"));
const app_config_1 = __importDefault(require("./app.config"));
// Load JSON configuration files
const deviceDataModelPath = path.join(__dirname, '../../config/deviceDataModel.json');
const mqttSubConfigPath = path.join(__dirname, '../../config/mqttSubConfig.json');
const airconControllerConfigPath = path.join(__dirname, '../../config/airconControllerConfig.json');
let deviceDataModel;
let mqttSubscriptions;
let airconControllerConfig;
try {
    deviceDataModel = JSON.parse(fs.readFileSync(deviceDataModelPath, 'utf8'));
    Logger.info('Device data model loaded successfully');
}
catch (error) {
    Logger.error('Failed to load deviceDataModel.json', error);
    throw error;
}
try {
    mqttSubscriptions = JSON.parse(fs.readFileSync(mqttSubConfigPath, 'utf8'));
    Logger.info('MQTT subscriptions loaded successfully', { path: mqttSubConfigPath });
}
catch (error) {
    Logger.error('Failed to load mqttSubConfig.json', error);
    throw error;
}
try {
    exports.airconControllerConfig = airconControllerConfig = JSON.parse(fs.readFileSync(airconControllerConfigPath, 'utf8'));
    Logger.info('Aircon controller config loaded successfully', { path: airconControllerConfigPath });
}
catch (error) {
    Logger.error('Failed to load airconControllerConfig.json', error);
    throw error;
}
// Export aggregated configuration
const config = {
    mqtt: mqtt_config_1.default,
    app: app_config_1.default,
    subscriptions: mqttSubscriptions,
    deviceDataModel: deviceDataModel
};
exports.default = config;
//# sourceMappingURL=index.js.map