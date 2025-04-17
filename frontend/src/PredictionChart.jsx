import { useEffect, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { getPredictions } from "./api";

export default function PredictionChart() {
  const [data, setData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getPredictions();
        const { predictions, latest_price } = response.data;

        const predictionArray = Object.entries(predictions).map(([model, price]) => ({
          model: model,
          predicted_price: parseFloat(price),
          latest_price: parseFloat(latest_price),
        }));

        setData(predictionArray);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Error fetching predictions:", error);
      }
    };

    fetchData(); // Fetch immediately on page load

    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval); // Cleanup interval when component unmounts
  }, []);

  return (
    <div className="p-10 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">📈 Crypto Price Predictions (Live Updating)</h2>
      <p className="text-gray-600 mb-4">
        Last updated at: <span className="font-semibold">{lastUpdated}</span>
      </p>
      <LineChart width={800} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="model" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="predicted_price" stroke="#8884d8" name="Predicted Price" />
        <Line type="monotone" dataKey="latest_price" stroke="#82ca9d" name="Latest Market Price" />
      </LineChart>
    </div>
  );
}
