import json
import boto3

client = boto3.client('secretsmanager')
response = client.get_secret_value(SecretId='iot/cert/prod')

secret_json_str = response['SecretString']  # or handle SecretBinary
secret_dict = json.loads(secret_json_str)

base64_private_key = secret_dict['PrivateKey']
base64_cert        = secret_dict['Cert']
base64_ca          = secret_dict['AmazonRootCA']

# If needed, decode them:
import base64
decoded_private_key = base64.b64decode(base64_private_key).decode('utf-8')
decoded_cert        = base64.b64decode(base64_cert).decode('utf-8')
decoded_ca          = base64.b64decode(base64_ca).decode('utf-8')
print(decoded_ca)