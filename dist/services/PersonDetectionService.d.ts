/**
 * Person Detection Service
 * Business logic for person detection and aircon control
 */
import PersonDetectionState from '../models/PersonDetectionState';
import DeviceDataModel from '../models/DeviceDataModel';
import { LocalMqttService } from './mqtt/LocalMqttService';
import { CloudMqttService } from './mqtt/CloudMqttService';
import { AppConfig } from '../types';
export declare class PersonDetectionService {
    private personDetectionState;
    private deviceModel;
    private localMqtt;
    private cloudMqtt;
    private config;
    constructor(personDetectionState: PersonDetectionState, deviceModel: DeviceDataModel, localMqtt: LocalMqttService, cloudMqtt: CloudMqttService, config: AppConfig);
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
    /**
     * Turn off all aircon controllers
     * @private
     */
    private _turnOffAllAircons;
    /**
     * Turn on all aircon controllers
     * @private
     */
    private _turnOnAllAircons;
}
export default PersonDetectionService;
//# sourceMappingURL=PersonDetectionService.d.ts.map