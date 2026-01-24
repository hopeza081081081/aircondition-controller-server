/**
 * MQTT Message Handler Service
 * Simple handler for processing MQTT messages and updating device state
 */
import DeviceDataModel from '../../models/DeviceDataModel';
import PersonDetectionState from '../../models/PersonDetectionState';
import { CloudMqttService } from './CloudMqttService';
export declare class MqttMessageHandlerService {
    private deviceModel;
    private personDetectionState;
    private cloudMqtt;
    private rpiMapper;
    constructor(deviceModel: DeviceDataModel, personDetectionState: PersonDetectionState, cloudMqtt: CloudMqttService);
    /**
     * Handle incoming MQTT message
     * @param topic - MQTT topic
     * @param message - Message payload
     */
    handle(topic: string, message: Buffer): Promise<void>;
    /**
     * Update local device state based on message
     * @private
     * @param topic - MQTT topic
     * @param message - Message payload
     */
    private _updateLocalState;
    /**
     * Relay message to cloud MQTT
     * @private
     * @param topic - MQTT topic
     * @param message - Message payload
     */
    private _relayToCloud;
    /**
     * Extract RPI ID from topic
     * @private
     * @param topic - MQTT topic
     * @returns RPI index (0, 1, etc.) or -1 if not found
     *
     * Supports formats:
     * - Legacy: myFinalProject/rpi1/objDetector -> 0
     * - New: myFinalProject/rpi_B827EB400668/objDetector -> mapped index
     */
    private _getRpiId;
    /**
     * Extract Aircon Controller ID from topic
     * @private
     * @param topic - MQTT topic
     * @returns Controller index (0, 1, or 2)
     */
    private _getControllerId;
}
export default MqttMessageHandlerService;
//# sourceMappingURL=MqttMessageHandlerService.d.ts.map