const awsIot = require('aws-iot-device-sdk');
const AWS = require('aws-sdk');

const secretsManager = new AWS.SecretsManager({ region: process.env.AWS_DEFAULT_REGION });

async function getCertificates(secretName) {
    const secretValue = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
    if (secretValue.SecretString) {
        return JSON.parse(secretValue.SecretString);
    }
    throw new Error('Certificates not found in Secrets Manager');
}

(async () => {
    try {
        // Fetch certificates from AWS Secrets Manager
        const secretName = 'iot/certs'; // Replace with your Secrets Manager secret name
        const certs = await getCertificates(secretName);

        // Initialize the IoT device
        const device = awsIot.device({
            privateKey: Buffer.from(certs.privateKey),
            clientCert: Buffer.from(certs.certificate),
            caCert: Buffer.from(certs.ca),
            clientId: 'iOTestID',
            host: process.env.IOT_END_POINT
        });

        const deviceSensorMap = {};

        function generateRandom(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        function generateSensorValue(sensorType) {
            return sensorType === "Temperature"
                ? (Math.random() * 110 - 10).toFixed(2) // Random temperature value between -10 and 100
                : (Math.random() * 100 + 1).toFixed(2); // Random pressure value between 1 and 100 Bar
        }

        device.on('connect', () => {
            console.log('Device connected to AWS IoT Core');

            setInterval(() => {
                const deviceId = `device_${generateRandom(1, 5)}`;

                if (!deviceSensorMap[deviceId]) {
                    deviceSensorMap[deviceId] = Math.random() < 0.5 ? "Pressure" : "Temperature";
                }

                const sensorType = deviceSensorMap[deviceId];
                const value = generateSensorValue(sensorType);

                const payload = JSON.stringify({
                    device_id: deviceId,
                    sensor_type: sensorType,
                    location: `Warehouse_${generateRandom(1, 3)}`,
                    value
                });

                device.publish('iot/sub', payload);
                console.log('Message sent:', payload);
            }, 5000);
        });

        device.on('error', (error) => {
            console.error('Error:', error);
        });
    } catch (err) {
        console.error('Failed to initialize device:', err);
    }
})();
