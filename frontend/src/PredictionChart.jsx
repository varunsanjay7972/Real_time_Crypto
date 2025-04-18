import { useEffect, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { getPredictions } from "./api";

export default function PredictionChart() {
  const [data, setData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [latestPrice, setLatestPrice] = useState(null);

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
        setLatestPrice(parseFloat(latest_price));
        setLastUpdated(new Date().toLocaleTimeString());

        if (!selectedModel && predictionArray.length > 0) {
          setSelectedModel(predictionArray[0]); // Set default selected model
        }
      } catch (error) {
        console.error("Error fetching predictions:", error);
      }
    };

    fetchData(); // Fetch immediately

    const interval = setInterval(fetchData, 5000); // Auto-refresh every 5 sec

    return () => clearInterval(interval); // Cleanup
  }, []);

  const handleSelectChange = (e) => {
    const selected = data.find(item => item.model === e.target.value);
    setSelectedModel(selected);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8 text-center">🚀 Crypto Real-Time Price Prediction Dashboard</h1>

      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-center">🔎 Select an Algorithm</h2>

        {/* Dropdown */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <select
            className="border border-gray-300 rounded-md p-2 w-64"
            value={selectedModel?.model || ""}
            onChange={handleSelectChange}
          >
            {data.map((item) => (
              <option key={item.model} value={item.model}>
                {item.model}
              </option>
            ))}
          </select>

          {/* Show Prediction + Latest Price */}
          {selectedModel && (
            <div className="text-center sm:text-left">
              <p className="text-lg font-semibold">
                🧠 Prediction: <span className="text-blue-600">{selectedModel.predicted_price.toFixed(2)}</span> USD
              </p>
              <p className="text-lg font-semibold">
                💰 Latest Price: <span className="text-green-600">{latestPrice?.toFixed(2)}</span> USD
              </p>
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm text-center mb-2">
          Last Updated: <span className="font-semibold">{lastUpdated}</span>
        </p>

        {/* Line Chart */}
        <div className="flex justify-center">
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
      </div>
    </div>
  );
}
