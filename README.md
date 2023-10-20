# Robot SiteWise Simulation

## Setup

`virtualenv` is recommended for installing system dependencies. For example:

```bash
sudo apt install -y python3-pip
pip3 install virtualenv
python3 -m virtualenv venv
source venv/bin/activate
pip install -r requirements
```

Then a number of constants need to be updated in the file. Create a Robot model in SiteWise with an integer battery field, then copy that property ID into [main.py](./main.py):

```python
BATTERY_PROPERTY_ID = "EXAMPLE-PROPERTY-ID"
```

Create a number of assets from the Robot model. For each, copy the asset ID into the list in [main.py](./main.py):

```python
ROBOT_ASSET_IDS = [
    "EXAMPLE-1",
    "EXAMPLE-2",
    "EXAMPLE-3",
    "EXAMPLE-4",
    "EXAMPLE-5",
]
```

Make sure that the AWS CLI is set up with valid credentials and permission to update asset properties in SiteWise. Then, run the main file:

```bash
python main.py
```

It should repeatedly update the assets, having randomly generated a battery health value. It should be possible to see different battery discharge rates between the robots.
