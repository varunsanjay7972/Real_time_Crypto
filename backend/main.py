from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import requests
import pandas as pd

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_methods=["*"],
)

# Load trained models
models = {
    name: joblib.load(f'models/{name}.pkl')
    for name in ["LinearRegression", "DecisionTree", "RandomForest", "GradientBoosting", "XGBoost", "SVR"]
}

@app.get("/")
def home():
    return {"message": "Crypto Prediction API is running!"}

def fetch_latest_price():
    url = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
    try:
        response = requests.get(url, timeout=5).json()
        if 'price' in response:
            return float(response['price'])
        else:
            print("Error fetching price, response:", response)
            return 0.0  # fallback price
    except Exception as e:
        print("Exception during price fetch:", e)
        return 0.0  # fallback price

@app.get("/predict/")
def predict():
    latest_price = fetch_latest_price()
    data = [latest_price]*5
    df = pd.DataFrame([data], columns=[f'lag_{i}' for i in range(1,6)])

    predictions = {name: float(model.predict(df)[0]) for name, model in models.items()}

    return {
        "predictions": predictions,
        "latest_price": latest_price
    }
