"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import axios from "axios"

// API function to get predictions (to check available algorithms)
const getPredictions = () => {
  return axios.get("https://real-time-crypto-2.onrender.com/predict/")
}

interface AlgorithmSelectorProps {
  selectedAlgorithm: string
  onAlgorithmChange: (algorithm: string) => void
  className?: string
}

export default function AlgorithmSelector({ selectedAlgorithm, onAlgorithmChange, className }: AlgorithmSelectorProps) {
  const [open, setOpen] = useState(false)
  const [algorithms, setAlgorithms] = useState([
    {
      value: "LinearRegression",
      label: "Linear Regression",
      description: "Simple and fast linear model",
    },
    {
      value: "DecisionTree",
      label: "Decision Tree",
      description: "Tree-based model for classification and regression",
    },
    {
      value: "RandomForest",
      label: "Random Forest",
      description: "Ensemble of decision trees",
    },
    {
      value: "GradientBoosting",
      label: "Gradient Boosting",
      description: "Boosting ensemble method",
    },
    {
      value: "XGBoost",
      label: "XGBoost",
      description: "Optimized gradient boosting library",
    },
    {
      value: "SVR",
      label: "Support Vector Regression",
      description: "Support vector machine for regression",
    },
  ])

  // Fetch available algorithms from API
  useEffect(() => {
    const fetchAlgorithms = async () => {
      try {
        const response = await getPredictions()
        const data = response.data

        // If we have predictions data, ensure our algorithm list matches what's available
        if (data && data.predictions) {
          const availableAlgorithms = Object.keys(data.predictions)

          // Update algorithms list if needed
          setAlgorithms((prev) => prev.filter((alg) => availableAlgorithms.includes(alg.value)))
        }
      } catch (error) {
        console.error("Error fetching algorithms:", error)
      }
    }

    fetchAlgorithms()
  }, [])

  const selectedAlgorithmData = algorithms.find((algorithm) => algorithm.value === selectedAlgorithm)

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-sm font-medium text-zinc-400">Select Algorithm</div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-left"
          >
            <div className="flex items-center">
              <Cpu className="mr-2 h-4 w-4 text-emerald-500" />
              {selectedAlgorithmData?.label || "Select algorithm"}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 border-zinc-700 bg-zinc-800">
          <Command>
            <CommandInput placeholder="Search algorithm..." />
            <CommandList>
              <CommandEmpty>No algorithm found.</CommandEmpty>
              <CommandGroup>
                {algorithms.map((algorithm) => (
                  <CommandItem
                    key={algorithm.value}
                    value={algorithm.value}
                    onSelect={() => {
                      onAlgorithmChange(algorithm.value)
                      setOpen(false)
                    }}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <Cpu className="mr-2 h-4 w-4 text-emerald-500" />
                        <span>{algorithm.label}</span>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedAlgorithm === algorithm.value ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </div>
                      <p className="text-xs text-zinc-400 ml-6">{algorithm.description}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="space-y-2 pt-4 border-t border-zinc-800">
        <div className="text-sm font-medium text-zinc-400">Algorithm Info</div>
        <div className="rounded-md bg-zinc-800/50 p-3 text-sm">
          <div className="font-medium">{selectedAlgorithmData?.label}</div>
          <div className="text-zinc-400 mt-1">{selectedAlgorithmData?.description}</div>
        </div>
      </div>
    </div>
  )
}
