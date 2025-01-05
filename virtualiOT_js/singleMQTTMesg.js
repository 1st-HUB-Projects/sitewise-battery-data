const awsIot = require('aws-iot-device-sdk');
//endpoint
const ioT_End_Point = "a5b18sm2w1aeo-ats.iot.us-east-1.amazonaws.com"
const region = "us-east-1"
const device = awsIot.device({
    keyPath: './certs/iOTest_PrivateKey.pem',        // Path to your private key
    certPath: './certs/iOTest_Cert.pem',             // Path to your certificate
    caPath: './certs/AmazonRootCA1.pem',        // Path to AWS Root CA
    clientId: 'iOTestID',            // Device client ID
    host: `${ioT_End_Point}`  // .iot.${region}.amazonaws.com`   AWS IoT endpoint
});

device.on('connect', function() {
    console.log('Connected to AWS IoT Core');
    // Publish random sensor data every 2 seconds

        const payload = JSON.stringify({
            
            temperature: (Math.random() * 10 + 20).toFixed(2), // Random temperature
            pressure: (Math.random() * 200 + 900).toFixed(2) ,  // Random pressure
            device_id: `device_${Math.floor(Math.random() * 5) + 1}`
        });
        device.publish('iot/sub', payload);  // Publish to the topic 'iot/sub'
        console.log('Message sent:', payload);

});

device.on('error', function(error) {
    console.error('Error:', error);
});
