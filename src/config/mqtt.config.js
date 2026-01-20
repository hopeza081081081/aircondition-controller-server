/**
 * MQTT Configuration
 * MQTT connection settings for local and cloud brokers
 */

const mqttConfig = {
  local: {
    host: '127.0.0.1',
    port: '1883',
    username: 'admin',
    password: '5617091',
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
    host: 'soldier.cloudmqtt.com',
    port: '11992',
    username: 'hrvmbcju',
    password: 'g7usW2NJz0H_',
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
