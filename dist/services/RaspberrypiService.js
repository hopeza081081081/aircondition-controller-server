"use strict";
/**
 * Device Controller
 * Manages device operations and periodic events
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaspberrypiService = void 0;
const Logger = require("../utils/Logger");
class RaspberrypiService {
    constructor(deviceModel, personDetectionService, airconController, config) {
        this.deviceModel = deviceModel;
        this.personDetectionService = personDetectionService;
        this.airconController = airconController;
        this.config = config;
        this.eventInterval = null;
        this.running = false;
        Logger.info("RaspberrypiService initialized");
    }
    /**
     * Start device controller
     */
    start() {
        if (this.running) {
            Logger.warn("RaspberrypiService already running");
            return;
        }
        this.running = true;
        // Start event processing loop
        this.eventInterval = setInterval(() => {
            this._processEvent();
        }, this.config.app.eventProcessInterval);
        Logger.info("RaspberrypiService started", {
            interval: `${this.config.app.eventProcessInterval}ms`,
        });
    }
    /**
     * Stop device controller
     */
    stop() {
        if (!this.running) {
            return;
        }
        this.running = false;
        if (this.eventInterval) {
            clearInterval(this.eventInterval);
            this.eventInterval = null;
        }
        Logger.info("RaspberrypiService stopped");
    }
    /**
     * Process periodic event
     * @private
     */
    async _processEvent() {
        try {
            // Update timestamp
            this.deviceModel.updateTimestamp();
            // Check RPI status and control aircons accordingly
            if (this.deviceModel.areAllRpisOffline()) {
                await this._handleAllRpisOffline();
            }
            else if (this.deviceModel.isAnyRpiOnline()) {
                await this._handleAnyRpiOnline();
            }
            // Note: MongoDB saving is handled by MongoDBService.startPeriodicSaving()
            // This method is called periodically by the service itself
        }
        catch (error) {
            Logger.error("RaspberrypiService event processing error", error);
        }
    }
    /**
     * Handle all RPIs offline scenario
     * @private
     */
    async _handleAllRpisOffline() {
        Logger.warn("All RPIs are offline, turning off all aircons");
        await this.airconController.turnOffAll("All RPIs offline");
    }
    /**
     * Handle at least one RPI online scenario
     * @private
     */
    async _handleAnyRpiOnline() {
        // Execute person detection logic
        await this.personDetectionService.execute();
    }
    /**
     * Check if controller is running
     * @returns {boolean}
     */
    isRunning() {
        return this.running;
    }
}
exports.RaspberrypiService = RaspberrypiService;
exports.default = RaspberrypiService;
//# sourceMappingURL=RaspberrypiService.js.map