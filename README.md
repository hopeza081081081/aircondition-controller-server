# Air Conditioning Controller Server

> IoT server application for automatic air conditioner control based on person detection

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![MQTT](https://img.shields.io/badge/MQTT-Protocol-orange)](https://mqtt.org/)

---

## 🎯 Overview

This system automatically controls air conditioners based on real-time person detection from Raspberry Pi cameras. When people are detected in the room, the air conditioners turn on. When the room is empty for a configurable period, they automatically turn off to save energy.

### Key Features

- ✨ **Automatic Control**: Turn air conditioners on/off based on person presence
- 🔄 **Auto-Reconnection**: Resilient MQTT connections with exponential backoff
- 💾 **Data Persistence**: MongoDB integration for historical data
- 🌐 **Dual MQTT**: Support for both local and cloud MQTT brokers
- 📊 **Real-time Monitoring**: Track device status and sensor readings
- 🛡️ **Graceful Degradation**: Continue operating even if some services fail
- 🔧 **Highly Configurable**: Environment-based configuration

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  Raspberry Pi   │     │  Raspberry Pi   │
│  (Person Detect)│     │  (Person Detect)│
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │ MQTT
              ┌──────▼──────┐
              │   Server    │
              │ (This App)  │
              └──────┬──────┘
                     │ Commands
         ┌───────────┼───────────┐
         │           │           │
    ┌────▼────┐ ┌───▼────┐ ┌───▼────┐
    │ Aircon  │ │ Aircon │ │ Aircon │
    │   #1    │ │   #2   │ │   #3   │
    └─────────┘ └────────┘ └────────┘
```

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **MQTT Broker** (Mosquitto recommended for local)
- **MongoDB** (optional, for data persistence)
- **Raspberry Pi** devices with person detection capability
- **ESP32** or compatible aircon controllers

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd aircondition-controller-server
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/iot-controller

# Local MQTT Broker
LOCAL_MQTT_HOST=localhost
LOCAL_MQTT_PORT=1883
LOCAL_MQTT_USERNAME=your_username
LOCAL_MQTT_PASSWORD=your_password

# Cloud MQTT Broker (optional)
CLOUD_MQTT_HOST=broker.hivemq.com
CLOUD_MQTT_PORT=1883

# Application Settings
EVENT_PROCESS_INTERVAL=1000          # Check interval (ms)
AIRCON_POWER_OFF_DURATION=300000     # Delay before turning off (5 min)
MONGODB_SAVE_INTERVAL=5000           # Data save interval (5 sec)
```

### 3. Run the Application

**Development mode** (with auto-reload):

```bash
npm run start:dev
```

**Production mode**:

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
src/
├── index.ts                 # Application entry point (34 lines)
├── bootstrap.ts             # Service initialization logic
├── shutdown.ts              # Graceful shutdown handling
├── config/
│   ├── index.ts            # Configuration loader
│   ├── app.config.ts       # Application config
│   ├── mqtt.config.ts      # MQTT config
│   └── constants.ts        # Centralized constants
├── services/
│   ├── AirconControllerService.ts      # Aircon control logic
│   ├── PersonDetectionService.ts       # Detection logic
│   ├── RaspberrypiService.ts           # Device controller
│   ├── MongoDBService.ts               # Database service
│   └── mqtt/
│       ├── LocalMqttService.ts         # Local MQTT
│       ├── CloudMqttService.ts         # Cloud MQTT
│       ├── MqttClient.ts               # Base MQTT client
│       └── MqttMessageHandlerService.ts # Message handler
├── models/
│   ├── DeviceDataModel.ts   # Device state management
│   └── PersonDetectionState.ts # Detection state
├── utils/
│   ├── Logger.ts            # Logging utility
│   ├── AirconTopicMapper.ts # Topic mapping
│   └── RpiTopicMapper.ts    # RPI topic mapping
├── types/
│   └── index.ts             # TypeScript type definitions
└── interfaces/
    └── index.ts             # Service interfaces
```

---

## 🔧 Configuration

### MQTT Topics

#### Subscriptions (Incoming)

- **Person Detection**: `myFinalProject/rpi_<ID>/objDetector`

  ```json
  { "isPerson": true, "prob": 0.95 }
  ```

- **RPI Status**: `myFinalProject/rpi_<ID>/onlineStatus/online`

  ```
  "true" or "false"
  ```

- **Aircon Measurements**: `myFinalProject/server/airconController/<ID>/measure`
  ```json
  { "voltage": 220, "current": 1.5, "power": 330, ... }
  ```

#### Publications (Outgoing)

- **Server Status**: `myFinalProject/server/properties/online`
- **Aircon Commands**: `myFinalProject/server/airconController/<ID>/command`

### Constants Configuration

Edit `src/config/constants.ts` to adjust:

- `MQTT_RECONNECT_INTERVAL`: Time between reconnection attempts
- `MAX_RETRY_ATTEMPTS`: Maximum MQTT publish retries
- `AIRCON_CONTROLLER_COUNT`: Number of air conditioners
- `DEFAULT_POWER_OFF_DURATION`: Delay before auto-shutdown

---

## 🎮 Operation Logic

### Person Detection Flow

1. **RPIs continuously publish** person detection status via MQTT
2. **Server receives** and updates person detection state
3. **Detection Service checks** every second:
   - **If person detected** → Turn ON all air conditioners
   - **If no person** → Start shutdown timer (default: 5 minutes)
   - **If person reappears** → Cancel timer, ensure aircons are ON
4. **Timer expires** → Turn OFF all air conditioners

### RPI Offline Handling

- If **all RPIs go offline** → Immediately turn off all aircons (safety measure)
- Auto-reconnection attempts continue in background
- When RPI comes back online → Resume normal detection logic

---

## 📊 Monitoring

### Startup Logs

```
========================================
Air Conditioning Controller Server
========================================
Initializing models...
Initializing MQTT services...
Initializing message handler...
Initializing aircon controller service...
Initializing person detection service...
Initializing MongoDB service...
Initializing device controller...
========================================
Application started successfully
========================================
MQTT Status:
  Local MQTT: ✓ Connected
  Cloud MQTT: ✓ Connected
MongoDB Status:
  MongoDB: ✓ Connected
========================================
```

### Health Indicators

Monitor these to ensure system health:

- ✅ Local MQTT connected
- ✅ At least one RPI online
- ✅ Aircon controllers responding
- ✅ MongoDB saving data (optional)

---

## 🐛 Troubleshooting

### MQTT Connection Issues

**Problem**: Local MQTT won't connect  
**Solutions**:

- Check if Mosquitto is running: `sudo systemctl status mosquitto`
- Verify credentials in `.env`
- Check firewall rules

**Problem**: Auto-reconnection not working  
**Check**: Logs should show retry attempts every 30 seconds

### Person Detection Not Working

**Problem**: Aircons don't respond to person detection  
**Check**:

1. RPIs are online (check MQTT messages)
2. Detection probability > 0.5 (threshold)
3. PersonDetectionService logs show correct state changes

### MongoDB Connection Failed

**Note**: Application continues without MongoDB  
**Impact**: No historical data saved  
**Solution**:

- Ensure MongoDB is running: `sudo systemctl start mongodb`
- Check connection string in `.env`

---

## 🔄 Development

### Available Scripts

```bash
# Development with auto-reload
npm run start:dev

# Build TypeScript to JavaScript
npm run build

# Build with watch mode
npm run build:watch

# Clean build directory
npm run clean

# Run production build
npm start
```

### Code Quality

The codebase follows these principles:

- **Single Responsibility**: Each service has one clear purpose
- **Separation of Concerns**: Logic split across focused modules
- **Type Safety**: Full TypeScript coverage
- **Error Resilience**: Comprehensive error handling
- **No Magic Numbers**: All constants centralized

---

## 📈 Recent Improvements

### v2.0 Refactoring (Latest)

- ✅ **Reduced code duplication** by ~150 lines (AirconControllerService)
- ✅ **Simplified entry point** from 222 lines → 34 lines
- ✅ **Centralized constants** - eliminated magic numbers
- ✅ **Modular architecture** - bootstrap, shutdown, entry point separated
- ✅ **Service interfaces** - improved testability and loose coupling

---

## 📝 License

ISC

---

## 👨‍💻 Author

Thanakorn Khunkhao

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📞 Support

For issues or questions:

- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Review logs for error messages
- Ensure all prerequisites are met

---

> **Note**: This project is designed for educational and personal use in IoT automation scenarios.
