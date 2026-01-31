"use strict";
/**
 * MongoDB Service
 * Handles MongoDB operations using async/await (no worker threads)
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBService = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Logger = require('../utils/Logger');
// MongoDB Schema - Dynamic arrays to support any number of devices
const deviceDataSchema = new mongoose_1.Schema({
    timeStamp: Date,
    MQTTbroker: { online: Boolean },
    server: { online: Boolean },
    rpi: [{
            online: Boolean,
            isperson: Boolean,
            prob: Number
        }],
    airconController: [{
            controllercmd: Boolean,
            properties: { wifiLocalIP: String, online: Boolean, bootcount: Number },
            measure: {
                voltage: { type: Number, default: null },
                current: { type: Number, default: null },
                power: { type: Number, default: null },
                energy: { type: Number, default: null },
                frequency: { type: Number, default: null }
            }
        }],
    lightingController: [{
            controllercmd: Boolean,
            properties: { wifiLocalIP: String, online: Boolean, bootcount: Number },
            measure: {
                voltage: { type: Number, default: null },
                current: { type: Number, default: null },
                power: { type: Number, default: null },
                energy: { type: Number, default: null },
                frequency: { type: Number, default: null }
            }
        }]
});
const DeviceData = mongoose_1.default.model('iotdevicedatas', deviceDataSchema);
class MongoDBService {
    constructor() {
        this.mongoUrl = process.env.MONGODB_URI || 'mongodb+srv://thanakorn:5617091@cluster0.ljv90.mongodb.net/finalproject';
        this.dataPushingInterval = 300000; // 5 minutes
        this.isConnected = false;
        this.saveInterval = null;
        Logger.info('MongoDBService initialized');
    }
    /**
     * Connect to MongoDB
     */
    async connect() {
        try {
            Logger.info('Connecting to MongoDB...');
            await mongoose_1.default.connect(this.mongoUrl, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                keepAlive: true,
                keepAliveInitialDelay: 60000
            });
            this.isConnected = true;
            Logger.info('MongoDB connected successfully');
            // Setup connection event handlers
            this._setupEventHandlers();
            return true;
        }
        catch (error) {
            Logger.error('Failed to connect to MongoDB', error);
            this.isConnected = false;
            throw error;
        }
    }
    /**
     * Setup MongoDB connection event handlers
     * @private
     */
    _setupEventHandlers() {
        const db = mongoose_1.default.connection;
        db.on('error', (error) => {
            Logger.error('MongoDB connection error', error);
            this.isConnected = false;
        });
        db.on('disconnected', () => {
            Logger.warn('MongoDB disconnected');
            this.isConnected = false;
        });
        db.on('reconnected', () => {
            Logger.info('MongoDB reconnected');
            this.isConnected = true;
        });
        db.on('reconnect', () => {
            Logger.info('MongoDB is reconnecting...');
        });
    }
    /**
     * Start periodic data saving
     * @param dataCallback - Callback function to get device data
     */
    startPeriodicSaving(dataCallback) {
        if (this.saveInterval) {
            Logger.warn('Periodic saving already started');
            return;
        }
        Logger.info('Starting periodic data saving', {
            interval: `${this.dataPushingInterval}ms`
        });
        this.saveInterval = setInterval(async () => {
            try {
                const deviceData = dataCallback();
                if (!deviceData) {
                    Logger.warn('No device data to save');
                    return;
                }
                await this.saveDeviceData(deviceData);
            }
            catch (error) {
                Logger.error('Error in periodic data saving', error);
            }
        }, this.dataPushingInterval);
    }
    /**
     * Stop periodic data saving
     */
    stopPeriodicSaving() {
        if (this.saveInterval) {
            clearInterval(this.saveInterval);
            this.saveInterval = null;
            Logger.info('Periodic data saving stopped');
        }
    }
    /**
     * Save device data to MongoDB
     * @param deviceDataModel - Device data model
     */
    async saveDeviceData(deviceDataModel) {
        try {
            if (!this.isConnected || !mongoose_1.default.connection.readyState) {
                Logger.warn('MongoDB not connected - skipping save');
                return;
            }
            Logger.debug(`Saving device data to MongoDB at ${deviceDataModel.timeStamp}`);
            const document = new DeviceData({
                timeStamp: deviceDataModel.timeStamp,
                MQTTbroker: { online: deviceDataModel.MQTTbroker.online },
                server: { online: true },
                rpi: deviceDataModel.rpi.map(rpi => ({
                    online: rpi.online,
                    isperson: rpi.isperson,
                    prob: rpi.prob
                })),
                airconController: deviceDataModel.airconController.map(aircon => ({
                    controllercmd: aircon.controllercmd,
                    properties: aircon.properties,
                    voltage: aircon.measure?.voltage,
                    current: aircon.measure?.current,
                    power: aircon.measure?.power,
                    energy: aircon.measure?.energy,
                    frequency: aircon.measure?.frequency
                })),
                lightingController: deviceDataModel.lightingController.map(light => ({
                    controllercmd: light.controllercmd,
                    properties: light.properties,
                    voltage: light.measure?.voltage,
                    current: light.measure?.current,
                    power: light.measure?.power,
                    energy: light.measure?.energy,
                    frequency: light.measure?.frequency
                }))
            });
            await document.save();
            Logger.info('Device data saved to MongoDB successfully');
        }
        catch (error) {
            Logger.error('Failed to save device data to MongoDB', error);
            // Don't throw - allow system to continue
        }
    }
    /**
     * Disconnect from MongoDB
     */
    async disconnect() {
        try {
            this.stopPeriodicSaving();
            await mongoose_1.default.disconnect();
            this.isConnected = false;
            Logger.info('MongoDB disconnected');
        }
        catch (error) {
            Logger.error('Error disconnecting from MongoDB', error);
        }
    }
    /**
     * Check if connected to MongoDB
     * @returns True if connected
     */
    isConnectionActive() {
        return this.isConnected && mongoose_1.default.connection.readyState === 1;
    }
}
exports.MongoDBService = MongoDBService;
exports.default = MongoDBService;
//# sourceMappingURL=MongoDBService.js.map