/**
 * Person Detection Service
 * Business logic for person detection and aircon control
 */

import PersonDetectionState from "../models/PersonDetectionState";
import AirconControllerService from "./AirconControllerService";
import { AppConfig } from "../types";
const Logger = require("../utils/Logger");

export class PersonDetectionService {
  private personDetectionState: PersonDetectionState;
  private airconController: AirconControllerService;
  private config: AppConfig;

  constructor(
    personDetectionState: PersonDetectionState,
    airconController: AirconControllerService,
    config: AppConfig,
  ) {
    this.personDetectionState = personDetectionState;
    this.airconController = airconController;
    this.config = config;
    Logger.info("PersonDetectionService initialized");
  }

  /**
   * Execute person detection logic
   */
  public async execute(): Promise<void> {
    try {
      const detections = this.personDetectionState.getAllDetectionMessages();

      // Check if any RPI detected a person
      const anyPersonDetected = detections.some(
        (detection) => detection.isPerson,
      );

      // No person detected by any RPI
      if (!anyPersonDetected) {
        await this._handleNoPersonDetected();
      }
      // Person detected by at least one RPI
      else {
        await this._handlePersonDetected();
      }
    } catch (error) {
      Logger.error("PersonDetectionService execution error", error as Error);
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
      Logger.info("Person disappeared, starting shutdown timer");

      this.personDetectionState.startShutdownTimer(async () => {
        await this.airconController.turnOffAll(
          "No person detected - shutdown timer expired",
        );
      }, this.config.app.airconPowerOffDuration);
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
      Logger.info("Person detected, turning on aircons");
      await this.airconController.turnOnAll("Person detected");
    }
  }
}

export default PersonDetectionService;
