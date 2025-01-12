// retrieve an dispaly a single  certficate  
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

async function main() {
  // Create Secrets Manager client
  const secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION });
  const secretName = 'iot/cert/prod';
  try {
    // Retrieve the saecret’s value
    const response = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: secretName
      })
    );

    let secretString= response.SecretString;

    //  JSON string of { "PrivateKey": "...", "Cert": "...", "AmazonRootCA": "..." }
    const secretObj = JSON.parse(secretString);

    // Extract just  the Privatekey  base64 string
    const base64PrivateKey = secretObj.PrivateKey;


    // Decode
    const privateKeyDecoded = Buffer.from(base64PrivateKey, 'base64').toString('utf-8');

    // Print out (or use) the decoded certificates
    console.log('== Decoded Private Key ==');
    console.log(privateKeyDecoded);

  } catch (err) {
    console.error('Error retrieving secret:', err);
  }
}

// Run the script
main();
