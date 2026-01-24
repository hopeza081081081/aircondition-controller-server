"use strict";
/**
 * RPI Topic Mapper Utility
 * Handles mapping between MQTT topics with unique identifiers and RPI indices
 *
 * Supports formats:
 * - Legacy: myFinalProject/rpi1/objDetector
 * - New: myFinalProject/rpi_B827EB400668/objDetector
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Logger = require("./Logger");
class RpiTopicMapper {
    constructor(config) {
        this.mapping = new Map();
        this.identifiers = [];
        if (config && config.length > 0) {
            // Initialize with provided config
            config.forEach((item) => {
                this.addMapping(item.identifier, item.index);
            });
            Logger.info("RpiTopicMapper initialized with config", {
                mappings: config,
            });
        }
        else {
            // Default legacy mappings
            this.addMapping("rpi1", 0);
            this.addMapping("rpi2", 1);
            Logger.info("RpiTopicMapper initialized with default legacy mappings");
        }
    }
    /**
     * Add or update a mapping
     * @param identifier - RPI identifier (e.g., 'rpi1', 'rpi_B827EB400668')
     * @param index - RPI index (0, 1, etc.)
     */
    addMapping(identifier, index) {
        this.mapping.set(identifier, index);
        // Ensure identifiers array is large enough
        while (this.identifiers.length <= index) {
            this.identifiers.push("");
        }
        this.identifiers[index] = identifier;
        Logger.debug(`RPI mapping added: ${identifier} -> index ${index}`);
    }
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
    getRpiId(topic) {
        // Extract RPI identifier from topic
        const identifier = this.extractIdentifier(topic);
        if (!identifier) {
            Logger.warn(`Could not extract RPI identifier from topic: ${topic}`);
            return -1;
        }
        // Check if identifier already mapped
        if (this.mapping.has(identifier)) {
            const index = this.mapping.get(identifier);
            Logger.debug(`RPI identifier '${identifier}' mapped to index ${index}`);
            return index;
        }
        // New identifier detected - auto-assign next available index
        const newIndex = this.mapping.size;
        this.addMapping(identifier, newIndex);
        Logger.info(`New RPI detected: '${identifier}' auto-assigned to index ${newIndex}`, {
            identifier,
            index: newIndex,
            topic,
        });
        return newIndex;
    }
    /**
     * Extract RPI identifier from topic
     * @private
     * @param topic - MQTT topic string
     * @returns Identifier string or null
     */
    extractIdentifier(topic) {
        // Match patterns:
        // - myFinalProject/rpi1/objDetector -> rpi1
        // - myFinalProject/rpi_B827EB400668/objDetector -> rpi_B827EB400668
        // Pattern 1: rpi<number> or rpi_<MAC_ADDRESS>
        const rpiPattern = /\/rpi(_[A-F0-9]{12}|\d+)\//i;
        const match = topic.match(rpiPattern);
        if (match && match[1]) {
            return `rpi${match[1]}`; // Return with 'rpi' prefix
        }
        // Pattern 2: Just look for anything between /rpi and /
        const genericPattern = /\/rpi([^\/]+)\//;
        const genericMatch = topic.match(genericPattern);
        if (genericMatch && genericMatch[1]) {
            return `rpi${genericMatch[1]}`;
        }
        return null;
    }
    /**
     * Get identifier by index
     * @param index - RPI index
     * @returns Identifier string or empty string if not found
     */
    getIdentifier(index) {
        if (index >= 0 && index < this.identifiers.length) {
            return this.identifiers[index];
        }
        return "";
    }
    /**
     * Get all mappings
     * @returns Array of {identifier, index} objects
     */
    getAllMappings() {
        return Array.from(this.mapping.entries()).map(([identifier, index]) => ({
            identifier,
            index,
        }));
    }
    /**
     * Check if identifier exists
     * @param identifier - RPI identifier
     * @returns True if mapped
     */
    hasIdentifier(identifier) {
        return this.mapping.has(identifier);
    }
    /**
     * Get total number of mapped RPIs
     * @returns Count of mapped RPIs
     */
    getCount() {
        return this.mapping.size;
    }
    /**
     * Reset all mappings
     */
    reset() {
        this.mapping.clear();
        this.identifiers = [];
        Logger.info("RpiTopicMapper reset");
    }
    /**
     * Validate if topic is an RPI topic
     * @param topic - MQTT topic string
     * @returns True if topic contains RPI identifier
     */
    isRpiTopic(topic) {
        return this.extractIdentifier(topic) !== null;
    }
}
exports.default = RpiTopicMapper;
//# sourceMappingURL=RpiTopicMapper.js.map