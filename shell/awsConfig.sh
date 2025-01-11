#!/bin/bash

if [[ -z "$AWS_ACCESS_KEY_ID" || -z "$AWS_SECRET_ACCESS_KEY" || -z "$AWS_DEFAULT_REGION" ]]; then
    echo "Environment variables AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_DEFAULT_REGION must be set."
    exit 1
fi

mkdir -p ~/.aws

# Write credentials
cat <<EOT > ~/.aws/credentials
[default]
aws_access_key_id = $AWS_ACCESS_KEY_ID
aws_secret_access_key = $AWS_SECRET_ACCESS_KEY
EOT

# Write config
cat <<EOT > ~/.aws/config
[default]
region = $AWS_DEFAULT_REGION
EOT

echo "AWS credentials and config have been updated!"
