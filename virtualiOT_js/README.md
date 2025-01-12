# Fixing the “Invalid keyPath option supplied” Error for AWS IoT

This document shows how to retrieve IoT certificates from **AWS Secrets Manager**
and then use them to publish MQTT messages to **AWS IoT Core**. We solved the
error:

Invalid "keyPath" option supplied.


which occurs when using in-memory certificates (Buffers) instead of file paths.

## Why the Error Occurs

In the `aws-iot-device-sdk`, there are two ways to specify device certificates:

1. **File Path Parameters**: `keyPath`, `certPath`, `caPath` (paths to local files).
2. **In-Memory Parameters**: `privateKey`, `clientCert`, `caCert` (actual data).

If you pass a Buffer/string to `keyPath` instead of a file path, you’ll get the
“Invalid keyPath option” error.

## The Fix

Use `privateKey`, `clientCert`, and `caCert` instead of the file-based keys. Below
is an example:

```js

which occurs when using in-memory certificates (Buffers) instead of file paths.

## Why the Error Occurs

In the `aws-iot-device-sdk`, there are two ways to specify device certificates:

1. **File Path Parameters**: `keyPath`, `certPath`, `caPath` (paths to local files).
2. **In-Memory Parameters**: `privateKey`, `clientCert`, `caCert` (actual data).

If you pass a Buffer/string to `keyPath` instead of a file path, you’ll get the
“Invalid keyPath option” error.

## The Fix

Use `privateKey`, `clientCert`, and `caCert` instead of the file-based keys. Below
is an example:

```js
/***********************************
 * Retrieve certs from AWS Secrets Manager
 * Connect to AWS IoT Core with aws-iot-device-sdk
 * Generate random payloads & publish to a topic
 ***********************************/
const {
  SecretsManagerClient,
  GetSecretValueCommand
} = require('@aws-sdk/client-secrets-manager');
const iot = require('aws-iot-device-sdk');
const { Buffer } = require('buffer');

// Environment variables or defaults
const AWS_DEFAULT_REGION = process.env.AWS_DEFAULT_REGION || 'us-east-1';
const IOT_END_POINT = process.env.IOT_END_POINT || 'xxxxxx-ats.iot.us-east-1.amazonaws.com';
const SECRET_NAME = process.env.SECRET_NAME || 'iot/cert/prod';

// Map device IDs to sensor types so each device is consistent
const deviceSensorMap = {};

// Generate a random integer between min and max
function generateRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Generate sensor value based on sensor type
function generateSensorValue(sensorType) {
  if (sensorType === "Temperature") {
    // Random temperature between -10 and 100
    return (Math.random() * 110 - 10).toFixed(2);
  } else {
    // Random pressure between 1 and 100
    return (Math.random() * 100 + 1).toFixed(2);
  }
}

async function main() {
  try {
    // 1) Retrieve IoT certificates from Secrets Manager
    const secretsClient = new SecretsManagerClient({ region: AWS_DEFAULT_REGION });
    const response = await secretsClient.send(
      new GetSecretValueCommand({ SecretId: SECRET_NAME })
    );

    const secretString = response.SecretString;
    // JSON structure like:
    // { "PrivateKey": "<base64>", "Cert": "<base64>", "AmazonRootCA": "<base64>" }
    const secretObj = JSON.parse(secretString);

    // Decode from base64 to Buffers (or strings).
    const privateKey = Buffer.from(secretObj.PrivateKey, 'base64');
    const cert = Buffer.from(secretObj.Cert, 'base64');
    const ca = Buffer.from(secretObj.AmazonRootCA, 'base64');

    // 2) Create IoT device using in-memory data
    const device = iot.device({
      privateKey: privateKey,
      clientCert: cert,
      caCert: ca,
      host: IOT_END_POINT,
      clientId: 'myUniqueClientId',
      protocol: 'mqtts'
    });

    // 3) Publish random messages on 'connect'
    device.on('connect', () => {
      console.log('Device connected to AWS IoT Core');

      setInterval(() => {
        const deviceId = `device_${generateRandom(1, 5)}`;
        if (!deviceSensorMap[deviceId]) {
          deviceSensorMap[deviceId] = (Math.random() < 0.5 ? "Pressure" : "Temperature");
        }

        const sensorType = deviceSensorMap[deviceId];
        const value = generateSensorValue(sensorType);
        const location = `Warehouse_${generateRandom(1, 3)}`;

        const payload = {
          device_id: deviceId,
          sensor_type: sensorType,
          location,
          value
        };

        // Publish to the 'iot/sub' topic
        device.publish('iot/sub', JSON.stringify(payload));
        console.log('Message sent:', payload);
      }, 4000);
    });

    device.on('error', (err) => {
      console.error('Device error:', err);
    });

    device.on('close', () => {
      console.log('Connection closed');
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
main();

```

# Conclusion

If your certificates are in memory (e.g., from Secrets Manager), use privateKey, clientCert, caCert.
If your certificates are on disk, specify keyPath, certPath, caPath.