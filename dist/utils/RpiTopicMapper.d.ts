/**
 * RPI Topic Mapper Utility
 * Handles mapping between MQTT topics with unique identifiers and RPI indices
 *
 * Supports formats:
 * - Legacy: myFinalProject/rpi1/objDetector
 * - New: myFinalProject/rpi_B827EB400668/objDetector
 */
import { RpiMappingConfig } from "../types";
declare class RpiTopicMapper {
    private mapping;
    private identifiers;
    constructor(config?: RpiMappingConfig[]);
    /**
     * Add or update a mapping
     * @param identifier - RPI identifier (e.g., 'rpi1', 'rpi_B827EB400668')
     * @param index - RPI index (0, 1, etc.)
     */
    addMapping(identifier: string, index: number): void;
    /**
     * Extract RPI index from MQTT topic
     * Supports both legacy (rpi1, rpi2) and new formats (rpi_B827EB400668)
     *
     * @param topic - MQTT topic string
     * @returns RPI index (0, 1, etc.) or -1 if not found
     *
     * @example
     * getRpiId('myFinalProject/rpi1/objDetector') // returns 0
     * getRpiId('myFinalProject/rpi_B827EB400668/objDetector') // returns index of B827EB400668
     */
    getRpiId(topic: string): number;
    /**
     * Extract RPI identifier from topic
     * @private
     * @param topic - MQTT topic string
     * @returns Identifier string or null
     */
    private extractIdentifier;
    /**
     * Get identifier by index
     * @param index - RPI index
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
     * @param identifier - RPI identifier
     * @returns True if mapped
     */
    hasIdentifier(identifier: string): boolean;
    /**
     * Get total number of mapped RPIs
     * @returns Count of mapped RPIs
     */
    getCount(): number;
    /**
     * Reset all mappings
     */
    reset(): void;
    /**
     * Validate if topic is an RPI topic
     * @param topic - MQTT topic string
     * @returns True if topic contains RPI identifier
     */
    isRpiTopic(topic: string): boolean;
}
export default RpiTopicMapper;
//# sourceMappingURL=RpiTopicMapper.d.ts.map