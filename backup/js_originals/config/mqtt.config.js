/**
 * MQTT Configuration
 * MQTT connection settings for local and cloud brokers
 */

const mqttConfig = {
  local: {
    host: process.env.LOCAL_MQTT_HOST || '127.0.0.1',
    port: process.env.LOCAL_MQTT_PORT || '1883',
    username: process.env.LOCAL_MQTT_USERNAME || 'admin',
    password: process.env.LOCAL_MQTT_PASSWORD || '',
    keepalive: 60,
    reconnectPeriod: 10000,
    will: {
      topic: 'myFinalProject/server/properties/online',
      payload: 'false',
      qos: 2,
      retain: true
    }
  },

  cloud: {
    host: process.env.CLOUD_MQTT_HOST || 'soldier.cloudmqtt.com',
    port: process.env.CLOUD_MQTT_PORT || '11992',
    username: process.env.CLOUD_MQTT_USERNAME || '',
    password: process.env.CLOUD_MQTT_PASSWORD || '',
    keepalive: 60,
    reconnectPeriod: 10000,
    will: {
      topic: 'myFinalProject/server/properties/online',
      payload: 'false',
      qos: 2,
      retain: true
    }
  }
};

module.exports = mqttConfig;
