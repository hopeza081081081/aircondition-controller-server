/**
 * Device Controller
 * Manages device operations and periodic events
 */

import DeviceDataModel from '../models/DeviceDataModel';
import { PersonDetectionService } from './PersonDetectionService';
import { LocalMqttService } from './mqtt/LocalMqttService';
import { CloudMqttService } from './mqtt/CloudMqttService';
import { AppConfig } from '../types';
const Logger = require('../utils/Logger');

export class RaspberrypiService {
  private deviceModel: DeviceDataModel;
  private personDetectionService: PersonDetectionService;
  private localMqtt: LocalMqttService;
  private cloudMqtt: CloudMqttService;
  private config: AppConfig;
  private eventInterval: NodeJS.Timeout | null;
  private running: boolean;

  constructor(
    deviceModel: DeviceDataModel,
    personDetectionService: PersonDetectionService,
    localMqtt: LocalMqttService,
    cloudMqtt: CloudMqttService,
    config: AppConfig
  ) {
    this.deviceModel = deviceModel;
    this.personDetectionService = personDetectionService;
    this.localMqtt = localMqtt;
    this.cloudMqtt = cloudMqtt;
    this.config = config;
    this.eventInterval = null;
    this.running = false;
    Logger.info('RaspberrypiService initialized');
  }

  /**
   * Start device controller
   */
  public start(): void {
    if (this.running) {
      Logger.warn('RaspberrypiService already running');
      return;
    }

    this.running = true;

    // Start event processing loop
    this.eventInterval = setInterval(() => {
      this._processEvent();
    }, this.config.app.eventProcessInterval);

    Logger.info('RaspberrypiService started', {
      interval: `${this.config.app.eventProcessInterval}ms`
    });
  }

  /**
   * Stop device controller
   */
  public stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;

    if (this.eventInterval) {
      clearInterval(this.eventInterval);
      this.eventInterval = null;
    }

    Logger.info('RaspberrypiService stopped');
  }

  /**
   * Process periodic event
   * @private
   */
  private async _processEvent(): Promise<void> {
    try {
      // Update timestamp
      this.deviceModel.updateTimestamp();

      // Check RPI status and control aircons accordingly
      if (this.deviceModel.areAllRpisOffline()) {
        await this._handleAllRpisOffline();
      } else if (this.deviceModel.isAnyRpiOnline()) {
        await this._handleAnyRpiOnline();
      }

      // Note: MongoDB saving is handled by MongoDBService.startPeriodicSaving()
      // This method is called periodically by the service itself
    } catch (error) {
      Logger.error('RaspberrypiService event processing error', error as Error);
    }
  }

  /**
   * Handle all RPIs offline scenario
   * @private
   */
  private async _handleAllRpisOffline(): Promise<void> {
    Logger.warn('All RPIs are offline, turning off all aircons');

    const controllerCount = this.deviceModel.state.airconController.length;

    for (let i = 0; i < controllerCount; i++) {
      const controllerId = i + 1;

      try {
        // Publish to local MQTT (only if connected)
        if (this.localMqtt && this.localMqtt.isConnected()) {
          await this.localMqtt.publishCommand(controllerId, 'false');
        } else {
          Logger.warn(`Local MQTT not connected - skipping controller ${controllerId} off command`);
        }

        // Publish to cloud MQTT (non-critical)
        if (this.cloudMqtt && this.cloudMqtt.isConnected()) {
          try {
            await this.cloudMqtt.publish(`myFinalProject/server/electricalAppliances/airconController${controllerId}/command`, 'false', { qos: 0, retain: true });
          } catch (cloudError) {
            Logger.warn(`Failed to relay controller ${controllerId} off command to cloud`, cloudError as Error);
          }
        }
      } catch (error) {
        Logger.error(`Failed to turn off controller ${controllerId} when RPIs offline`, error as Error);
      }
    }
  }

  /**
   * Handle at least one RPI online scenario
   * @private
   */
  private async _handleAnyRpiOnline(): Promise<void> {
    // Execute person detection logic
    await this.personDetectionService.execute();
  }

  /**
   * Check if controller is running
   * @returns {boolean}
   */
  public isRunning(): boolean {
    return this.running;
  }
}

export default RaspberrypiService;
