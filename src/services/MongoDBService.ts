/**
 * MongoDB Service
 * Handles MongoDB operations using async/await (no worker threads)
 */

import mongoose, { Schema, Connection } from 'mongoose';
import { DeviceDataState } from '../types';
const Logger = require('../utils/Logger');

// MongoDB Schema - Dynamic arrays to support any number of devices
const deviceDataSchema = new Schema({
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

const DeviceData = mongoose.model('iotdevicedatas', deviceDataSchema);

export class MongoDBService {
  private mongoUrl: string;
  private dataPushingInterval: number;
  public isConnected: boolean;
  private saveInterval: NodeJS.Timeout | null;

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
  public async connect(): Promise<boolean> {
    try {
      Logger.info('Connecting to MongoDB...');

      await mongoose.connect(this.mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        keepAlive: true,
        keepAliveInitialDelay: 60000
      } as mongoose.ConnectOptions);

      this.isConnected = true;
      Logger.info('MongoDB connected successfully');

      // Setup connection event handlers
      this._setupEventHandlers();

      return true;
    } catch (error) {
      Logger.error('Failed to connect to MongoDB', error as Error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Setup MongoDB connection event handlers
   * @private
   */
  private _setupEventHandlers(): void {
    const db: Connection = mongoose.connection;

    db.on('error', (error: Error) => {
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
  public startPeriodicSaving(dataCallback: () => DeviceDataState): void {
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
      } catch (error) {
        Logger.error('Error in periodic data saving', error as Error);
      }
    }, this.dataPushingInterval);
  }

  /**
   * Stop periodic data saving
   */
  public stopPeriodicSaving(): void {
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
  public async saveDeviceData(deviceDataModel: DeviceDataState): Promise<void> {
    try {
      if (!this.isConnected || !mongoose.connection.readyState) {
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
    } catch (error) {
      Logger.error('Failed to save device data to MongoDB', error as Error);
      // Don't throw - allow system to continue
    }
  }

  /**
   * Disconnect from MongoDB
   */
  public async disconnect(): Promise<void> {
    try {
      this.stopPeriodicSaving();
      await mongoose.disconnect();
      this.isConnected = false;
      Logger.info('MongoDB disconnected');
    } catch (error) {
      Logger.error('Error disconnecting from MongoDB', error as Error);
    }
  }

  /**
   * Check if connected to MongoDB
   * @returns True if connected
   */
  public isConnectionActive(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

export default MongoDBService;
