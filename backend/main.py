from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import requests
import pandas as pd
import numpy as np

app = FastAPI()

# Add CORS Middleware (VERY IMPORTANT for frontend connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models = {
    name: joblib.load(f'models/{name}.pkl') 
    for name in ["LinearRegression", "DecisionTree", "RandomForest", "GradientBoosting", "XGBoost", "SVR"]
}

@app.get("/")
def home():
    return {"message": "Crypto Prediction API is running!"}

def fetch_latest_price():
    url = 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
    response = requests.get(url).json()
    return float(response['price'])

@app.get("/predict/")
def predict():
    latest_price = fetch_latest_price()
    data = [latest_price]*5
    df = pd.DataFrame([data], columns=[f'lag_{i}' for i in range(1,6)])

    # Explicitly convert predictions to Python float
    predictions = {name: float(model.predict(df)[0]) for name, model in models.items()}

    return {
        "predictions": predictions,
        "latest_price": latest_price
    }
