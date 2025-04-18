"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ChartDataPoint {
  time: string
  actualPrice: number
  predictedPrice: number
  difference: string
}

interface EnhancedChartProps {
  data: ChartDataPoint[]
  isLoading: boolean
  selectedAlgorithm: string
}

export default function EnhancedChart({ data, isLoading, selectedAlgorithm }: EnhancedChartProps) {
  const [timeRange, setTimeRange] = useState<"1h" | "4h" | "all">("all")

  // Filter data based on selected time range
  const filteredData = (() => {
    if (timeRange === "all" || data.length === 0) return data

    const now = new Date()
    const cutoffTime = new Date(now.getTime() - (timeRange === "1h" ? 60 * 60 * 1000 : 4 * 60 * 60 * 1000))

    return data.filter((point) => new Date(point.time) >= cutoffTime)
  })()

  // Calculate min and max for better visualization
  const priceValues = filteredData.flatMap((d) => [d.actualPrice, d.predictedPrice])
  const minPrice = Math.min(...priceValues) * 0.999
  const maxPrice = Math.max(...priceValues) * 1.001

  // Calculate latest price for reference line
  const latestPrice = filteredData.length > 0 ? filteredData[filteredData.length - 1].actualPrice : 0

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Price Prediction Chart</h3>
          <p className="text-sm text-zinc-400">Comparing actual price with {selectedAlgorithm} predictions</p>
        </div>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="w-auto">
          <TabsList className="bg-zinc-800">
            <TabsTrigger value="1h">1H</TabsTrigger>
            <TabsTrigger value="4h">4H</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <CardContent className="p-0 pt-4">
        {isLoading && data.length === 0 ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="h-[400px] px-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(time) => {
                    const date = new Date(time)
                    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
                  }}
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                />
                <YAxis
                  domain={[minPrice, maxPrice]}
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  tickFormatter={(value) => value.toFixed(0)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      const time = new Date(data.time)
                      const formattedTime = `${time.toLocaleDateString()} ${time.toLocaleTimeString()}`

                      return (
                        <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-md shadow-lg">
                          <p className="text-xs text-zinc-400">{formattedTime}</p>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                              <span className="text-sm text-zinc-300">Actual: </span>
                              <span className="text-sm font-medium ml-1">{data.actualPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                              <span className="text-sm text-zinc-300">Predicted: </span>
                              <span className="text-sm font-medium ml-1">{data.predictedPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-sm text-zinc-300">Diff: </span>
                              <span
                                className={`text-sm font-medium ml-1 ${Number(data.difference) >= 0 ? "text-emerald-500" : "text-red-500"}`}
                              >
                                {data.difference}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />

                {/* Reference line for latest price */}
                <ReferenceLine
                  y={latestPrice}
                  stroke="rgba(255,255,255,0.5)"
                  strokeDasharray="3 3"
                  label={{
                    value: "Current",
                    position: "right",
                    fill: "rgba(255,255,255,0.7)",
                    fontSize: 12,
                  }}
                />

                {/* Area under the actual price line */}
                <Area type="monotone" dataKey="actualPrice" stroke="none" fillOpacity={1} fill="url(#colorActual)" />

                {/* Actual price line */}
                <Line
                  type="monotone"
                  dataKey="actualPrice"
                  stroke="hsl(221, 83%, 53%)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: "hsl(221, 83%, 53%)", stroke: "#fff" }}
                />

                {/* Predicted price line */}
                <Line
                  type="monotone"
                  dataKey="predictedPrice"
                  stroke="hsl(142, 71%, 45%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 6, fill: "hsl(142, 71%, 45%)", stroke: "#fff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm text-zinc-400">Actual Price</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
              <span className="text-sm text-zinc-400">Predicted Price</span>
            </div>
          </div>
          <span className="text-sm text-zinc-400">
            {timeRange === "all" ? "All available data" : `Last ${timeRange}`}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
