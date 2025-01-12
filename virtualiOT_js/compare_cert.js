const {
    SecretsManagerClient,
    GetSecretValueCommand,
  } = require("@aws-sdk/client-secrets-manager");
  const fs = require("fs");
  const path = require("path");
  const { Buffer } = require("buffer");
  
  const AWS_DEFAULT_REGION = process.env.AWS_DEFAULT_REGION || "us-east-1";
  const SECRET_NAME = process.env.SECRET_NAME || "iot/cert/prod";
  const CERTS_DIR = "./.certs"; // Directory where your original .pem files are
  
  async function compareCertificates() {
    try {
      // 1. Retrieve the secret from Secrets Manager
      const secretsClient = new SecretsManagerClient({ region: AWS_DEFAULT_REGION });
      const response = await secretsClient.send(
        new GetSecretValueCommand({ SecretId: SECRET_NAME })
      );
  
      const secretString = response.SecretString;
      const secretObj = JSON.parse(secretString);
  
      // 2. Decode the Base64 strings back to PEM format
      const decodedPrivateKey = Buffer.from(
        secretObj.PrivateKey,
        "base64"
      ).toString("utf-8");
      const decodedCert = Buffer.from(secretObj.Cert, "base64").toString("utf-8");
      const decodedCaCert = Buffer.from(
        secretObj.AmazonRootCA,
        "base64"
      ).toString("utf-8");
  
      // 3. Read the original .pem files from the ./certs directory
      const originalPrivateKey = fs.readFileSync(
        path.join(CERTS_DIR, "iOTest_PrivateKey.pem"),
        "utf-8"
      );
      const originalCert = fs.readFileSync(
        path.join(CERTS_DIR, "iOTest_Cert.pem"),
        "utf-8"
      );
      const originalCaCert = fs.readFileSync(
        path.join(CERTS_DIR, "AmazonRootCA.pem"),
        "utf-8"
      );
  
      // 4. Compare the decoded strings with the original file contents
      console.log("Comparing Private Key:");
      if (decodedPrivateKey === originalPrivateKey) {
        console.log("  Private Key: MATCH");
      } else {
        console.log("  Private Key: DO NOT MATCH");
        // You might want to log or diff the contents here to see the differences
        // console.log("Decoded:\n", decodedPrivateKey);
        // console.log("Original:\n", originalPrivateKey);
      }
  
      console.log("\nComparing Certificate:");
      if (decodedCert === originalCert) {
        console.log("  Certificate: MATCH");
      } else {
        console.log("  Certificate: DO NOT MATCH");
        // console.log("Decoded:\n", decodedCert);
        // console.log("Original:\n", originalCert);
      }
  
      console.log("\nComparing CA Certificate:");
      if (decodedCaCert === originalCaCert) {
        console.log("  CA Certificate: MATCH");
      } else {
        console.log("  CA Certificate: DO NOT MATCH");
        // console.log("Decoded:\n", decodedCaCert);
        // console.log("Original:\n", originalCaCert);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  
  compareCertificates();