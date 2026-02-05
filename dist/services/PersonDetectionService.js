"use strict";
/**
 * Person Detection Service
 * Business logic for person detection and aircon control
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonDetectionService = void 0;
const Logger = require("../utils/Logger");
class PersonDetectionService {
    constructor(personDetectionState, airconController, config) {
        this.personDetectionState = personDetectionState;
        this.airconController = airconController;
        this.config = config;
        Logger.info("PersonDetectionService initialized");
    }
    /**
     * Execute person detection logic
     */
    async execute() {
        try {
            const detections = this.personDetectionState.getAllDetectionMessages();
            // Check if any RPI detected a person
            const anyPersonDetected = detections.some((detection) => detection.isPerson);
            // No person detected by any RPI
            if (!anyPersonDetected) {
                await this._handleNoPersonDetected();
            }
            // Person detected by at least one RPI
            else {
                await this._handlePersonDetected();
            }
        }
        catch (error) {
            Logger.error("PersonDetectionService execution error", error);
        }
    }
    /**
     * Handle no person detected scenario
     * @private
     */
    async _handleNoPersonDetected() {
        // If person was detected before, start shutdown timer
        if (this.personDetectionState.getCurrentState()) {
            this.personDetectionState.setState(false);
            Logger.info("Person disappeared, starting shutdown timer");
            this.personDetectionState.startShutdownTimer(async () => {
                await this.airconController.turnOffAll("No person detected - shutdown timer expired");
            }, this.config.app.airconPowerOffDuration);
        }
    }
    /**
     * Handle person detected scenario
     * @private
     */
    async _handlePersonDetected() {
        // If person was not detected before, turn on aircons
        if (!this.personDetectionState.getCurrentState()) {
            this.personDetectionState.clearShutdownTimer();
            this.personDetectionState.setState(true);
            Logger.info("Person detected, turning on aircons");
            await this.airconController.turnOnAll("Person detected");
        }
    }
}
exports.PersonDetectionService = PersonDetectionService;
exports.default = PersonDetectionService;
//# sourceMappingURL=PersonDetectionService.js.map