/**
 * Person Detection Service
 * Business logic for person detection and aircon control
 */
import PersonDetectionState from "../models/PersonDetectionState";
import AirconControllerService from "./AirconControllerService";
import { AppConfig } from "../types";
export declare class PersonDetectionService {
    private personDetectionState;
    private airconController;
    private config;
    constructor(personDetectionState: PersonDetectionState, airconController: AirconControllerService, config: AppConfig);
    /**
     * Execute person detection logic
     */
    execute(): Promise<void>;
    /**
     * Handle no person detected scenario
     * @private
     */
    private _handleNoPersonDetected;
    /**
     * Handle person detected scenario
     * @private
     */
    private _handlePersonDetected;
}
export default PersonDetectionService;
//# sourceMappingURL=PersonDetectionService.d.ts.map