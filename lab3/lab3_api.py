import requests
import time
import pandas as pd
from datetime import datetime, timezone

all_records = []

headers = {
    "User-Agent": "STATS401-Class-Exercise/1.0"
}

for offset in range(1, 1001, 200):

    url = "https://earthquake.usgs.gov/fdsnws/event/1/query"

    try:

        params = {
               "format": "geojson",
               "minmagnitude": 2.5,
               "limit": 200,
               "offset": offset,
               "orderby": "time"
            }

        response = requests.get(
            url,
            params=params,
            headers=headers,
            timeout=10
        )

        response.raise_for_status()

    except requests.RequestException as error:
        print("Request failed:", error)
        continue

    data = response.json()

    all_records.extend(data["features"])

    if len(all_records) >= 1000:
        break

    time.sleep(1)

print(all_records[0])

clean_records = []

for record in all_records:

    time_ms = record["properties"]["time"]

    time_readable = datetime.fromtimestamp(
    time_ms / 1000,
    tz=timezone.utc
    ).strftime("%Y-%m-%d %H:%M:%S UTC")

    place = record["properties"]["place"]

    country = (
       place.split(",")[-1].strip()
       if place
       else "Unknown"
    )

    record = {
        "id": record["id"],
        "magnitude": record["properties"]["mag"],
        "place": place,
        "country": country,
        "time": time_readable,
        "longitude": record["geometry"]["coordinates"][0],
        "latitude": record["geometry"]["coordinates"][1],
        "depth": record["geometry"]["coordinates"][2]
    }

    clean_records.append(record)

print(clean_records[0])

df = pd.DataFrame(clean_records)

print(df.head())

print(len(df))

df.to_csv(
    "data/lab3_data.csv",
    index=False
)
