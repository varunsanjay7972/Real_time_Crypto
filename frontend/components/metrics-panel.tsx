"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AlertCircle, ArrowRight, BarChart4, Percent, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// API function to get metrics (this would be your actual metrics endpoint)
const getMetrics = async () => {
  // Since we don't have a real metrics API, we'll simulate one based on the algorithm
  // In a real application, you would replace this with an actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          metrics: {
            LinearRegression: {
              accuracy: "72%",
              rmse: "1.24",
              mae: "0.98",
              r2: "0.68",
            },
            DecisionTree: {
              accuracy: "76%",
              rmse: "1.18",
              mae: "0.92",
              r2: "0.71",
            },
            RandomForest: {
              accuracy: "84%",
              rmse: "0.87",
              mae: "0.65",
              r2: "0.79",
            },
            GradientBoosting: {
              accuracy: "86%",
              rmse: "0.82",
              mae: "0.61",
              r2: "0.81",
            },
            XGBoost: {
              accuracy: "89%",
              rmse: "0.76",
              mae: "0.58",
              r2: "0.84",
            },
            SVR: {
              accuracy: "78%",
              rmse: "1.05",
              mae: "0.84",
              r2: "0.74",
            },
          },
        },
      })
    }, 500)
  })
}

interface MetricsPanelProps {
  algorithm: string
  isLoading?: boolean
}

export default function MetricsPanel({ algorithm, isLoading = false }: MetricsPanelProps) {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const response = await getMetrics()
        setMetrics(response.data.metrics)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching metrics:", error)
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  const currentMetrics = metrics?.[algorithm] || {
    accuracy: "N/A",
    rmse: "N/A",
    mae: "N/A",
    r2: "N/A",
  }

  const isMetricsLoading = isLoading || loading

  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader>
        <CardTitle>Algorithm Performance Metrics</CardTitle>
        <CardDescription>Key performance indicators for the {algorithm} model</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid grid-cols-2 bg-zinc-800">
            <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
            <TabsTrigger value="comparison">Algorithm Comparison</TabsTrigger>
          </TabsList>
          <TabsContent value="metrics">
            {isMetricsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-zinc-800 animate-pulse rounded-md"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <MetricCard
                  title="Prediction Accuracy"
                  value={currentMetrics.accuracy}
                  icon={<Percent className="h-4 w-4 text-emerald-500" />}
                  description="Overall accuracy"
                />
                <MetricCard
                  title="RMSE"
                  value={currentMetrics.rmse}
                  icon={<AlertCircle className="h-4 w-4 text-amber-500" />}
                  description="Root Mean Square Error"
                />
                <MetricCard
                  title="MAE"
                  value={currentMetrics.mae}
                  icon={<BarChart4 className="h-4 w-4 text-blue-500" />}
                  description="Mean Absolute Error"
                />
                <MetricCard
                  title="R² Score"
                  value={currentMetrics.r2}
                  icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
                  description="Coefficient of determination"
                />
              </div>
            )}
          </TabsContent>
          <TabsContent value="comparison">
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Algorithm Ranking</div>
                <div className="space-y-2">
                  {metrics &&
                    Object.keys(metrics)
                      .sort((a, b) => Number.parseFloat(metrics[b].accuracy) - Number.parseFloat(metrics[a].accuracy))
                      .map((alg, index) => (
                        <div
                          key={alg}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-md",
                            alg === algorithm ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-zinc-800",
                          )}
                        >
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center mr-3 text-xs">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium flex items-center">
                                {alg}
                                {alg === algorithm && (
                                  <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full">
                                    Current
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-zinc-400">Accuracy: {metrics[alg].accuracy}</div>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-zinc-500" />
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface MetricCardProps {
  title: string
  value: string
  icon: React.ReactNode
  description: string
}

function MetricCard({ title, value, icon, description }: MetricCardProps) {
  return (
    <div className="bg-zinc-800 rounded-md p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-zinc-400">{title}</div>
        <div className="rounded-full bg-zinc-700 p-1">{icon}</div>
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{description}</div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
