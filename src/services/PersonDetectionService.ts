/**
 * Person Detection Service
 * Business logic for person detection and aircon control
 */

import PersonDetectionState from '../models/PersonDetectionState';
import DeviceDataModel from '../models/DeviceDataModel';
import { LocalMqttService } from './mqtt/LocalMqttService';
import { CloudMqttService } from './mqtt/CloudMqttService';
import { AppConfig } from '../types';
const Logger = require('../utils/Logger');

export class PersonDetectionService {
  private personDetectionState: PersonDetectionState;
  private deviceModel: DeviceDataModel;
  private localMqtt: LocalMqttService;
  private cloudMqtt: CloudMqttService;
  private config: AppConfig;

  constructor(
    personDetectionState: PersonDetectionState,
    deviceModel: DeviceDataModel,
    localMqtt: LocalMqttService,
    cloudMqtt: CloudMqttService,
    config: AppConfig
  ) {
    this.personDetectionState = personDetectionState;
    this.deviceModel = deviceModel;
    this.localMqtt = localMqtt;
    this.cloudMqtt = cloudMqtt;
    this.config = config;
    Logger.info('PersonDetectionService initialized');
  }

  /**
   * Execute person detection logic
   */
  public async execute(): Promise<void> {
    try {
      const detections = this.personDetectionState.getAllDetectionMessages();

      // Check if any RPI detected a person
      const anyPersonDetected = detections.some(detection => detection.isPerson);

      // No person detected by any RPI
      if (!anyPersonDetected) {
        await this._handleNoPersonDetected();
      }
      // Person detected by at least one RPI
      else {
        await this._handlePersonDetected();
      }
    } catch (error) {
      Logger.error('PersonDetectionService execution error', error as Error);
    }
  }

  /**
   * Handle no person detected scenario
   * @private
   */
  private async _handleNoPersonDetected(): Promise<void> {
    // If person was detected before, start shutdown timer
    if (this.personDetectionState.getCurrentState()) {
      this.personDetectionState.setState(false);
      Logger.info('Person disappeared, starting shutdown timer');

      this.personDetectionState.startShutdownTimer(
        async () => {
          await this._turnOffAllAircons();
        },
        this.config.app.airconPowerOffDuration
      );
    }
  }

  /**
   * Handle person detected scenario
   * @private
   */
  private async _handlePersonDetected(): Promise<void> {
    // If person was not detected before, turn on aircons
    if (!this.personDetectionState.getCurrentState()) {
      this.personDetectionState.clearShutdownTimer();
      this.personDetectionState.setState(true);
      Logger.info('Person detected, turning on aircons');
      await this._turnOnAllAircons();
    }
  }

  /**
   * Turn off all aircon controllers
   * @private
   */
  private async _turnOffAllAircons(): Promise<void> {
    const controllerCount = this.deviceModel.state.airconController.length;

    for (let i = 0; i < controllerCount; i++) {
      const controllerId = i;

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
            // Get the identifier for this controller
            const identifier = this.localMqtt.getAirconIdentifier(controllerId);
            if (identifier) {
              await this.cloudMqtt.publish(`myFinalProject/server/airconController/${identifier}/command`, 'false', { qos: 0, retain: true });
            } else {
              Logger.warn(`No identifier found for controller index ${controllerId}`);
            }
          } catch (cloudError) {
            Logger.warn(`Failed to relay controller ${controllerId} off command to cloud`, cloudError as Error);
          }
        }

        // Update device model
        this.deviceModel.setAirconCommand(i, false);
      } catch (error) {
        Logger.error(`Failed to turn off controller ${controllerId}`, error as Error);
      }
    }

    Logger.info('All aircon controllers turned off');
  }

  /**
   * Turn on all aircon controllers
   * @private
   */
  private async _turnOnAllAircons(): Promise<void> {
    const controllerCount = this.deviceModel.state.airconController.length;

    for (let i = 0; i < controllerCount; i++) {
      const controllerId = i;

      try {
        // Publish to local MQTT (only if connected)
        if (this.localMqtt && this.localMqtt.isConnected()) {
          await this.localMqtt.publishCommand(controllerId, 'true');
        } else {
          Logger.warn(`Local MQTT not connected - skipping controller ${controllerId} on command`);
        }

        // Publish to cloud MQTT (non-critical)
        if (this.cloudMqtt && this.cloudMqtt.isConnected()) {
          try {
            // Get the identifier for this controller
            const identifier = this.localMqtt.getAirconIdentifier(controllerId);
            if (identifier) {
              await this.cloudMqtt.publish(`myFinalProject/server/airconController/${identifier}/command`, 'true', { qos: 0, retain: true });
            } else {
              Logger.warn(`No identifier found for controller index ${controllerId}`);
            }
          } catch (cloudError) {
            Logger.warn(`Failed to relay controller ${controllerId} on command to cloud`, cloudError as Error);
          }
        }

        // Update device model
        this.deviceModel.setAirconCommand(i, true);
      } catch (error) {
        Logger.error(`Failed to turn on controller ${controllerId}`, error as Error);
      }
    }

    Logger.info('All aircon controllers turned on');
  }
}

export default PersonDetectionService;
