/**
 * Aircon Controller Topic Mapper Utility
 * Handles mapping between MQTT topics with unique identifiers and aircon controller indices
 *
 * Supports format:
 * - myFinalProject/airconController/aircon_8CAAB5936934/data
 */

import { AirconMappingConfig } from "../types";
const Logger = require("./Logger");

class AirconTopicMapper {
  private mapping: Map<string, number>; // Maps identifier to index
  private identifiers: string[]; // Array of identifiers by index

  constructor(config?: AirconMappingConfig[]) {
    this.mapping = new Map();
    this.identifiers = [];

    if (config && config.length > 0) {
      // Initialize with provided config
      config.forEach((item) => {
        this.addMapping(item.identifier, item.index);
      });
      Logger.info("AirconTopicMapper initialized with config", {
        mappings: config,
      });
    } else {
      Logger.warn("AirconTopicMapper initialized without config - will use auto-assignment");
    }
  }

  /**
   * Add or update a mapping
   * @param identifier - Aircon controller identifier (e.g., 'airconController1', 'aircon_8CAAB5936934')
   * @param index - Aircon controller index (0, 1, 2, etc.)
   */
  public addMapping(identifier: string, index: number): void {
    this.mapping.set(identifier, index);

    // Ensure identifiers array is large enough
    while (this.identifiers.length <= index) {
      this.identifiers.push("");
    }
    this.identifiers[index] = identifier;

    Logger.debug(`Aircon controller mapping added: ${identifier} -> index ${index}`);
  }

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
  public getControllerId(topic: string): number {
    // Extract controller identifier from topic
    const identifier = this.extractIdentifier(topic);

    if (!identifier) {
      Logger.warn(`Could not extract aircon controller identifier from topic: ${topic}`);
      return -1;
    }

    // Check if identifier already mapped
    if (this.mapping.has(identifier)) {
      const index = this.mapping.get(identifier)!;
      Logger.debug(`Aircon controller identifier '${identifier}' mapped to index ${index}`);
      return index;
    }

    // New identifier detected - auto-assign next available index
    const newIndex = this.mapping.size;
    this.addMapping(identifier, newIndex);

    Logger.info(
      `New aircon controller detected: '${identifier}' auto-assigned to index ${newIndex}`,
      {
        identifier,
        index: newIndex,
        topic,
      },
    );

    return newIndex;
  }

  /**
   * Extract aircon controller identifier from topic
   * @private
   * @param topic - MQTT topic string
   * @returns Identifier string or null
   */
  private extractIdentifier(topic: string): string | null {
    // Match pattern: myFinalProject/airconController/aircon_8CAAB5936934/data
    const pattern = /\/airconController\/aircon_([A-F0-9]{12})\//i;
    const match = topic.match(pattern);

    if (match && match[1]) {
      return `aircon_${match[1]}`; // Return with 'aircon_' prefix
    }

    return null;
  }

  /**
   * Get identifier by index
   * @param index - Aircon controller index
   * @returns Identifier string or empty string if not found
   */
  public getIdentifier(index: number): string {
    if (index >= 0 && index < this.identifiers.length) {
      return this.identifiers[index];
    }
    return "";
  }

  /**
   * Get all mappings
   * @returns Array of {identifier, index} objects
   */
  public getAllMappings(): { identifier: string; index: number }[] {
    return Array.from(this.mapping.entries()).map(([identifier, index]) => ({
      identifier,
      index,
    }));
  }

  /**
   * Check if identifier exists
   * @param identifier - Aircon controller identifier
   * @returns True if mapped
   */
  public hasIdentifier(identifier: string): boolean {
    return this.mapping.has(identifier);
  }

  /**
   * Get total number of mapped controllers
   * @returns Count of mapped controllers
   */
  public getCount(): number {
    return this.mapping.size;
  }

  /**
   * Reset all mappings
   */
  public reset(): void {
    this.mapping.clear();
    this.identifiers = [];
    Logger.info("AirconTopicMapper reset");
  }

  /**
   * Validate if topic is an aircon controller topic
   * @param topic - MQTT topic string
   * @returns True if topic contains aircon controller identifier
   */
  public isAirconControllerTopic(topic: string): boolean {
    const pattern = /\/airconController\/aircon_([A-F0-9]{12})\//i;
    return pattern.test(topic);
  }
}

export default AirconTopicMapper;
