"use client"

import { useState, useEffect } from "react"
import { Activity, BarChart3, ChevronsUpDown, Clock, Cpu, Menu, RefreshCw } from "lucide-react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AlgorithmSelector from "@/components/algorithm-selector"
import PriceCard from "@/components/price-card"
import MetricsPanel from "@/components/metrics-panel"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import EnhancedChart from "@/components/enhanced-chart"

// API function to get predictions
const getPredictions = () => {
  return axios.get("https://real-time-crypto-2.onrender.com/predict/")
}

// Interface for API response
interface PredictionData {
  predictions: {
    LinearRegression: number
    DecisionTree: number
    RandomForest: number
    GradientBoosting: number
    XGBoost: number
    SVR: number
    [key: string]: number
  }
  latest_price: number
}

// Interface for chart data point
interface ChartDataPoint {
  time: string
  actualPrice: number
  predictedPrice: number
  difference: string
}

export default function Dashboard() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("LinearRegression")
  const [priceData, setPriceData] = useState<ChartDataPoint[]>([])
  const [currentPrediction, setCurrentPrediction] = useState<PredictionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("1h")
  const [error, setError] = useState<string | null>(null)

  // Replace the existing fetchPredictionData function with this enhanced version
  const fetchPredictionData = async () => {
    try {
      const response = await getPredictions()
      const data: PredictionData = response.data

      setCurrentPrediction(data)

      // Add new data point to chart
      setPriceData((prevData) => {
        const now = new Date()
        const newDataPoint = {
          time: now.toISOString(),
          actualPrice: data.latest_price,
          predictedPrice: data.predictions[selectedAlgorithm],
          difference: (data.predictions[selectedAlgorithm] - data.latest_price).toFixed(2),
        }

        // Keep last 100 data points for the chart (increased from 20)
        const updatedData = [...prevData, newDataPoint]
        if (updatedData.length > 100) {
          return updatedData.slice(updatedData.length - 100)
        }
        return updatedData
      })

      setIsLoading(false)
    } catch (err) {
      console.error("Error fetching prediction data:", err)
      setError("Failed to fetch prediction data. Please try again later.")
      setIsLoading(false)
    }
  }

  // Add this function after the fetchPredictionData function
  // Generate historical data to simulate a trading chart with many data points
  const generateHistoricalData = () => {
    const data: ChartDataPoint[] = []
    const now = new Date()
    let basePrice = 84000 + Math.random() * 1000

    // Generate 100 historical data points
    for (let i = 100; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000) // One point per minute

      // Create realistic price movements
      const priceChange = (Math.random() - 0.5) * 200
      basePrice += priceChange

      // Add some randomness to predicted price, but follow a trend
      const predictedPrice = basePrice + (Math.random() - 0.4) * 300

      data.push({
        time: time.toISOString(),
        actualPrice: basePrice,
        predictedPrice: predictedPrice,
        difference: (predictedPrice - basePrice).toFixed(2),
      })
    }

    return data
  }

  // Modify the initial useEffect to include historical data generation
  // Replace the first useEffect with this one
  useEffect(() => {
    // First, generate historical data to populate the chart
    if (priceData.length === 0) {
      setPriceData(generateHistoricalData())
    }

    // Then fetch the latest data
    fetchPredictionData()

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      fetchPredictionData()
    }, 10000) // Fetch every 10 seconds for more frequent updates

    return () => clearInterval(interval)
  }, [])

  // Update chart data when algorithm changes
  useEffect(() => {
    if (currentPrediction) {
      setPriceData((prevData) =>
        prevData.map((point) => ({
          ...point,
          predictedPrice: currentPrediction.predictions[selectedAlgorithm],
          difference: (currentPrediction.predictions[selectedAlgorithm] - point.actualPrice).toFixed(2),
        })),
      )
    }
  }, [selectedAlgorithm, currentPrediction])

  // Handle algorithm change
  const handleAlgorithmChange = (algorithm: string) => {
    setIsLoading(true)
    setSelectedAlgorithm(algorithm)

    // Simulate a brief loading state for better UX
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  // Handle manual refresh
  const handleRefresh = () => {
    setIsLoading(true)
    fetchPredictionData()
  }

  // Calculate current price and prediction
  const currentPrice = currentPrediction?.latest_price.toFixed(2) || "0.00"
  const predictedPrice = currentPrediction?.predictions[selectedAlgorithm].toFixed(2) || "0.00"
  const priceDifference = currentPrediction
    ? (currentPrediction.predictions[selectedAlgorithm] - currentPrediction.latest_price).toFixed(2)
    : "0.00"
  const percentChange =
    currentPrediction && currentPrediction.latest_price !== 0
      ? ((Number(priceDifference) / currentPrediction.latest_price) * 100).toFixed(2)
      : "0.00"

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-zinc-900 border-zinc-800 p-0">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold flex items-center">
                <Activity className="mr-2 h-5 w-5 text-emerald-500" />
                ML Trading
              </h2>
            </div>
            <AlgorithmSelector
              selectedAlgorithm={selectedAlgorithm}
              onAlgorithmChange={handleAlgorithmChange}
              className="p-4"
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-zinc-900 border-r border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold flex items-center">
            <Activity className="mr-2 h-5 w-5 text-emerald-500" />
            ML Trading
          </h2>
        </div>
        <AlgorithmSelector
          selectedAlgorithm={selectedAlgorithm}
          onAlgorithmChange={handleAlgorithmChange}
          className="p-4"
        />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">Price Prediction Dashboard</h1>
                <p className="text-zinc-400">Using {selectedAlgorithm} algorithm</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 border-zinc-700 bg-zinc-800/50">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Live</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-zinc-700 bg-zinc-800/50"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </Button>
                <div className="border border-zinc-700 rounded-md bg-zinc-800/50">
                  <Tabs defaultValue="1h" className="w-[180px]">
                    <TabsList className="grid grid-cols-3 bg-transparent">
                      <TabsTrigger value="1h" onClick={() => setTimeframe("1h")}>
                        1H
                      </TabsTrigger>
                      <TabsTrigger value="4h" onClick={() => setTimeframe("4h")}>
                        4H
                      </TabsTrigger>
                      <TabsTrigger value="1d" onClick={() => setTimeframe("1d")}>
                        1D
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* Error message if API fails */}
            {error && <div className="bg-red-900/20 border border-red-900 text-red-400 p-4 rounded-md">{error}</div>}

            {/* Price cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PriceCard
                title="Current Price"
                value={`$${currentPrice}`}
                icon={<BarChart3 className="h-4 w-4 text-blue-500" />}
                footer="Last updated just now"
                isLoading={isLoading}
              />
              <PriceCard
                title="Predicted Price"
                value={`$${predictedPrice}`}
                icon={<Cpu className="h-4 w-4 text-emerald-500" />}
                footer={`${selectedAlgorithm} prediction`}
                isLoading={isLoading}
              />
              <PriceCard
                title="Difference"
                value={`$${priceDifference} (${percentChange}%)`}
                icon={<ChevronsUpDown className="h-4 w-4 text-purple-500" />}
                footer="Prediction vs. Actual"
                trend={Number(priceDifference) > 0 ? "up" : "down"}
                isLoading={isLoading}
              />
            </div>

            {/* Chart */}
            <EnhancedChart
              data={priceData}
              isLoading={isLoading}
              selectedAlgorithm={selectedAlgorithm}
              timeframe={timeframe}
            />

            {/* Metrics */}
            <MetricsPanel algorithm={selectedAlgorithm} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}
