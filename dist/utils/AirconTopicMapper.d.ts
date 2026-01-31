/**
 * Aircon Controller Topic Mapper Utility
 * Handles mapping between MQTT topics with unique identifiers and aircon controller indices
 *
 * Supports format:
 * - myFinalProject/airconController/aircon_8CAAB5936934/data
 */
import { AirconMappingConfig } from "../types";
declare class AirconTopicMapper {
    private mapping;
    private identifiers;
    constructor(config?: AirconMappingConfig[]);
    /**
     * Add or update a mapping
     * @param identifier - Aircon controller identifier (e.g., 'airconController1', 'aircon_8CAAB5936934')
     * @param index - Aircon controller index (0, 1, 2, etc.)
     */
    addMapping(identifier: string, index: number): void;
    /**
     * Extract aircon controller index from MQTT topic
     * Supports new format: aircon_8CAAB5936934
     *
     * @param topic - MQTT topic string
     * @returns Aircon controller index (0, 1, 2, etc.) or -1 if not found
     *
     * @example
     * getControllerId('myFinalProject/airconController/aircon_8CAAB5936934/data') // returns index of aircon_8CAAB5936934
     */
    getControllerId(topic: string): number;
    /**
     * Extract aircon controller identifier from topic
     * @private
     * @param topic - MQTT topic string
     * @returns Identifier string or null
     */
    private extractIdentifier;
    /**
     * Get identifier by index
     * @param index - Aircon controller index
     * @returns Identifier string or empty string if not found
     */
    getIdentifier(index: number): string;
    /**
     * Get all mappings
     * @returns Array of {identifier, index} objects
     */
    getAllMappings(): {
        identifier: string;
        index: number;
    }[];
    /**
     * Check if identifier exists
     * @param identifier - Aircon controller identifier
     * @returns True if mapped
     */
    hasIdentifier(identifier: string): boolean;
    /**
     * Get total number of mapped controllers
     * @returns Count of mapped controllers
     */
    getCount(): number;
    /**
     * Reset all mappings
     */
    reset(): void;
    /**
     * Validate if topic is an aircon controller topic
     * @param topic - MQTT topic string
     * @returns True if topic contains aircon controller identifier
     */
    isAirconControllerTopic(topic: string): boolean;
}
export default AirconTopicMapper;
//# sourceMappingURL=AirconTopicMapper.d.ts.map