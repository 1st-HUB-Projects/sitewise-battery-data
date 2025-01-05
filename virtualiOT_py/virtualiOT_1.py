
import boto3
import datetime
import random
import time

# AWS SiteWise Aliases
alias_speed = '/factory/Motor1/Speed'
alias_temperature = '/factory/Motor1/Temperature'  # Define a new alias for temperature

# Create a Boto3 SiteWise client (Make sure region_name is the one you plan to use)
client = boto3.client('iotsitewise', region_name='us-east-1')

# Send data at 3-second intervals indefinitely
while True:
    speed = round(random.uniform(0, 1000), 2)  # Generate a random CO2 value
    temperature = round(random.uniform(-10, 110), 2)  # Generate a random temperature value
    epoch = int(time.time())  # Get the current epoch timestamp using time.time()

    # Create the JSON payload with both CO2 and temperature entries
    payload = {
        "entries": [
            {
                "entryId": f"{epoch}-co2",
                "propertyAlias": alias_speed,
                "propertyValues": [
                    {
                        "value": {"doubleValue": speed},
                        "timestamp": {"timeInSeconds": epoch},
                        "quality": "GOOD"
                    }
                ]
            },
            {
                "entryId": f"{epoch}-temp",
                "propertyAlias": alias_temperature,
                "propertyValues": [
                    {
                        "value": {"doubleValue": temperature},
                        "timestamp": {"timeInSeconds": epoch},
                        "quality": "GOOD"
                    }
                ]
            }
        ]
    }

    # Send the data to AWS SiteWise
    try:
        response = client.batch_put_asset_property_value(entries=payload['entries'])
        print(f"Data sent successfully: {payload}")
    except Exception as e:
        print(f"Error sending data: {e}")

    time.sleep(5)  # Wait for 5 seconds before sending the next set of data
