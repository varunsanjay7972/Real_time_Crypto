import requests
import pandas as pd
import time

def fetch_crypto_price():
    prices = []
    url = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'

    for _ in range(10):  # fetching 10 samples for testing
        try:
            response = requests.get(url).json()
            price = float(response['price'])
            print(f"Fetched price: {price}")
            prices.append({'timestamp': pd.Timestamp.now(), 'price': price})
        except Exception as e:
            print("Error fetching data:", e)
        time.sleep(5)  # wait 5 seconds

    pd.DataFrame(prices).to_csv("data/bitcoin_prices.csv", index=False)
    print("Data fetching completed and saved as bitcoin_prices.csv")

fetch_crypto_price()
