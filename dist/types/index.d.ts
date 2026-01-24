/**
 * Type Definitions for Air Conditioning Controller Server
 */
export interface MqttConfig {
    host: string;
    port: string;
    username: string;
    password: string;
    keepalive: number;
    reconnectPeriod: number;
    will: {
        topic: string;
        payload: string;
        qos: number;
        retain: boolean;
    };
}
export interface MqttConfigs {
    local: MqttConfig;
    cloud: MqttConfig;
}
export interface MqttMessage {
    topic: string;
    message: Buffer;
}
export interface RPIState {
    online: boolean;
    isperson: boolean;
    prob: number;
}
export interface AirconMeasure {
    voltage: number | null;
    current: number | null;
    power: number | null;
    energy: number | null;
    frequency: number | null;
}
export interface DeviceProperties {
    wifiLocalIP: string;
    online: boolean;
    bootcount: number;
}
export interface AirconController {
    controllercmd: boolean;
    properties: DeviceProperties;
    measure: AirconMeasure;
}
export interface LightingController extends AirconController {
}
export interface MqttBrokerState {
    online: boolean;
}
export interface DeviceDataState {
    timeStamp: Date;
    MQTTbroker: MqttBrokerState;
    server: {
        online: boolean;
    };
    rpi: [RPIState, RPIState];
    airconController: [AirconController, AirconController, AirconController];
    lightingController: [LightingController];
}
export interface PersonDetectionMessage {
    isPerson: boolean;
    prob: number;
}
export interface DetectionState {
    isPersonDetected: boolean;
    detectionMessages: [PersonDetectionMessage, PersonDetectionMessage];
    shutdownTimer: NodeJS.Timeout | null;
}
export interface SubscriptionConfig {
    [topic: string]: {
        qos: number;
    };
}
export interface AppConfig {
    mqtt: MqttConfigs;
    subscriptions: SubscriptionConfig;
    app: {
        airconPowerOffDuration: number;
        eventProcessInterval: number;
        dataPushingInterval: number;
        rpiCount: number;
        airconControllerCount: number;
        lightingControllerCount: number;
    };
    deviceDataModel: DeviceDataState;
}
export interface IMqttClient {
    connect(): Promise<void>;
    on(event: string, handler: (...args: any[]) => void): void;
    publish(topic: string, message: string, options?: {
        qos: number;
        retain: boolean;
    }): Promise<void>;
    subscribe(topics: {
        [topic: string]: {
            qos: number;
        };
    }): Promise<void>;
    isConnected(): boolean;
    disconnect(): void;
}
export interface IMessageHandler {
    handle(topic: string, message: Buffer): Promise<void>;
}
export interface IPersonDetectionService {
    execute(): Promise<void>;
}
export interface IDeviceController {
    start(): void;
    stop(): void;
    isRunning(): boolean;
}
export interface IMongoDBService {
    connect(): Promise<boolean>;
    startPeriodicSaving(dataCallback: () => DeviceDataState): void;
    stopPeriodicSaving(): void;
    saveDeviceData(deviceDataModel: DeviceDataState): Promise<void>;
    disconnect(): Promise<void>;
    isConnectionActive(): boolean;
}
export type QoS = 0 | 1 | 2;
export interface PublishOptions {
    qos: QoS;
    retain: boolean;
}
export interface LoggerOptions {
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
}
export interface RpiMappingConfig {
    identifier: string;
    index: number;
}
//# sourceMappingURL=index.d.ts.map