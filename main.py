import boto3
import random
import time
from typing import Dict
from uuid import uuid4


BATTERY_PROPERTY_ID = ""
ROBOT_ASSET_IDS = [

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
        time.sleep(1)


if __name__ == "__main__":
    main()
