import requests
import pandas as pd
import time

def fetch_crypto_price():
    prices = []
    url = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'

    for _ in range(10):  # fetching 10 samples
        try:
            response = requests.get(url, timeout=5).json()
            if 'price' in response:
                price = float(response['price'])
                print(f"Fetched price: {price}")
                prices.append({'timestamp': pd.Timestamp.now(), 'price': price})
            else:
                print("Error: Unexpected response from Binance:", response)
        except Exception as e:
            print("Error fetching data:", e)
        time.sleep(5)  # 5 seconds delay between fetches

    if prices:
        pd.DataFrame(prices).to_csv("data/bitcoin_prices.csv", index=False)
        print("Data fetching completed and saved as bitcoin_prices.csv")
    else:
        print("No prices fetched. CSV not saved.")

if __name__ == "__main__":
    fetch_crypto_price()
