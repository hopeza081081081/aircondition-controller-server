/**
 * Device Controller
 * Manages device operations and periodic events
 */
import DeviceDataModel from "../models/DeviceDataModel";
import { PersonDetectionService } from "./PersonDetectionService";
import AirconControllerService from "./AirconControllerService";
import { AppConfig } from "../types";
export declare class RaspberrypiService {
    private deviceModel;
    private personDetectionService;
    private airconController;
    private config;
    private eventInterval;
    private running;
    constructor(deviceModel: DeviceDataModel, personDetectionService: PersonDetectionService, airconController: AirconControllerService, config: AppConfig);
    /**
     * Start device controller
     */
    start(): void;
    /**
     * Stop device controller
     */
    stop(): void;
    /**
     * Process periodic event
     * @private
     */
    private _processEvent;
    /**
     * Handle all RPIs offline scenario
     * @private
     */
    private _handleAllRpisOffline;
    /**
     * Handle at least one RPI online scenario
     * @private
     */
    private _handleAnyRpiOnline;
    /**
     * Check if controller is running
     * @returns {boolean}
     */
    isRunning(): boolean;
}
export default RaspberrypiService;
//# sourceMappingURL=RaspberrypiService.d.ts.map