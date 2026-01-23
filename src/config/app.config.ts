/**
 * Application Configuration
 * Application settings and constants
 */

import { AppConfig } from "../types";

const appConfig: AppConfig["app"] = {
  // Time intervals (in milliseconds)
  airconPowerOffDuration: 300000, // 5 minutes - delay before turning off aircons
  eventProcessInterval: 5000, // 5 seconds - main event loop interval
  dataPushingInterval: 300000, // 5 minutes - MongoDB save interval

  // Device counts
  rpiCount: 2, // Number of Raspberry Pi cameras
  airconControllerCount: 3, // Number of aircon controllers
  lightingControllerCount: 1, // Number of lighting controllers
};

export default appConfig;
