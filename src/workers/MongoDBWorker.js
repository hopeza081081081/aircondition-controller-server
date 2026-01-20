/**
 * MongoDB Worker
 * Worker thread for MongoDB data persistence
 */

const mongoose = require('mongoose');
const { parentPort } = require('worker_threads');
const Logger = require('../utils/Logger');

// MongoDB Schema
const deviceDataSchema = new mongoose.Schema({
  timeStamp: Date,
  MQTTbroker: { online: Boolean },
  server: { online: Boolean },
  rpi: [
    {
      online: Boolean,
      isperson: Boolean,
      prob: Number
    },
    {
      online: Boolean,
      isperson: Boolean,
      prob: Number
    }
  ],
  airconController: [
    {
      controllercmd: Boolean,
      properties: { wifiLocalIP: String, online: Boolean, bootcount: Number },
      voltage: Number,
      current: Number,
      power: Number,
      energy: Number,
      frequency: Number
    },
    {
      controllercmd: Boolean,
      properties: { wifiLocalIP: String, online: Boolean, bootcount: Number },
      voltage: Number,
      current: Number,
      power: Number,
      energy: Number,
      frequency: Number
    },
    {
      controllercmd: Boolean,
      properties: { wifiLocalIP: String, online: Boolean, bootcount: Number },
      voltage: Number,
      current: Number,
      power: Number,
      energy: Number,
      frequency: Number
    }
  ],
  lightingController: [
    {
      controllercmd: Boolean,
      properties: { wifiLocalIP: String, online: Boolean, bootcount: Number },
      voltage: Number,
      current: Number,
      power: Number,
      energy: Number,
      frequency: Number
    }
  ]
});

const DeviceData = mongoose.model('iotdevicedatas', deviceDataSchema);

// MongoDB connection
const mongoUrl = 'mongodb+srv://thanakorn:5617091@cluster0.ljv90.mongodb.net/finalproject';
const dataPushingInterval = 300000; // 5 minutes

let deviceDataModel = null;

/**
 * Connect to MongoDB
 */
async function connectToMongoDB() {
  return new Promise((resolve, reject) => {
    Logger.info('Connecting to MongoDB...');

    mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      keepAlive: true,
      keepAliveInitialDelay: 60000
    }).catch((error) => {
      Logger.error('MongoDB connection error', error);
      reject(error);
    });

    const db = mongoose.connection;

    db.on('error', (error) => {
      Logger.error('MongoDB error', error);
    });

    db.on('connected', () => {
      Logger.info('MongoDB connected successfully');
      resolve();
    });

    db.on('disconnected', () => {
      Logger.warn('MongoDB disconnected');
    });

    db.on('reconnected', () => {
      Logger.info('MongoDB reconnected');
    });

    db.on('reconnect', () => {
      Logger.info('MongoDB is reconnecting...');
    });
  });
}

/**
 * Save device data to MongoDB
 */
function startDataSaving() {
  setInterval(async () => {
    try {
      if (!deviceDataModel) {
        Logger.warn('No device data to save');
        return;
      }

      Logger.info(`Saving device data to MongoDB at ${deviceDataModel.timeStamp}`);

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
      Logger.error('Failed to save device data to MongoDB', error);
    }
  }, dataPushingInterval);
}

/**
 * Main worker function
 */
async function main() {
  try {
    // Listen for messages from main thread
    parentPort.on('message', (message) => {
      deviceDataModel = message;
    });

    // Connect to MongoDB
    await connectToMongoDB();

    // Start periodic data saving
    startDataSaving();

    Logger.info('MongoDBWorker started successfully');
  } catch (error) {
    Logger.error('MongoDBWorker failed to start', error);
    process.exit(1);
  }
}

main();
