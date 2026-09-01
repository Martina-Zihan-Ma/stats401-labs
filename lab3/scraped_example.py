import requests
import time

for page in range(1, 6):

    url = (
        "https://books.toscrape.com/"
        f"catalogue/page-{page}.html"
    )

    response = requests.get(
        url,
        timeout=10
    )

    response.raise_for_status()

    print("Downloaded page", page)

    time.sleep(1)