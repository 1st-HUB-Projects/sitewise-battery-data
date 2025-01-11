import boto3
import random
import time
from typing import Dict
from uuid import uuid4


BATTERY_PROPERTY_ID = "11c55dde-26fd-48ba-aee4-83250fadaa79"
ROBOT_ASSET_IDS = [
"acf5b516-7f8b-496f-b02b-d2309e939192", "b40e1cee-0ea7-44d2-9e91-2fe22a9deccf", "77b59322-fd40-499c-8d90-c17f1ed1103e",
"be46e17b-155a-44a4-8820-71db0764eab8","6afb9f88-dc71-4ca7-9100-138dd147853e"
]


class Robot:
    def __init__(self, asset_id: str):
        self._asset_id = asset_id
        self._battery_health = random.random()
        self._battery = random.randint(30, 90)
        self._charging = False

    def build_message(self) -> Dict:
        if self._charging:
            self._battery = max(100, self._battery + 40)
            if self._battery == 100:
                self._charging = False
        else:
            self._battery -= int(8 * (1.1 - self._battery_health))
            if self._battery < 10:
                self._charging = True
        print(self._asset_id, self._battery, self._battery_health)

        return {
            "entryId": str(uuid4()),
            "assetId": self._asset_id,
            "propertyId": BATTERY_PROPERTY_ID,
            "propertyValues": [{
                "value": {
                    "integerValue": self._battery,
                },
                "timestamp": { 
                    "timeInSeconds": int(time.time()),
                },
            }],
        }


def main():
    client = boto3.client('iotsitewise')
    robots = [Robot(asset_id) for asset_id in ROBOT_ASSET_IDS]

    while True:
        entries = [robot.build_message() for robot in robots]
        client.batch_put_asset_property_value(entries=entries)
        print(f"Tick complete. Posted {len(robots)} statuses.")
        time.sleep(4)


if __name__ == "__main__":
    main()
