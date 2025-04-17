import pandas as pd

df = pd.read_csv('data/bitcoin_prices.csv', parse_dates=['timestamp'])

for i in range(1, 6):
    df[f'lag_{i}'] = df['price'].shift(i)

df.dropna().to_csv('data/preprocessed_crypto.csv', index=False)
print("Preprocessing complete. File saved as preprocessed_crypto.csv.")
