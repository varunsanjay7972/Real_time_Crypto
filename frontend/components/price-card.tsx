import type { ReactNode } from "react"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PriceCardProps {
  title: string
  value: string
  icon: ReactNode
  footer: string
  trend?: "up" | "down"
  isLoading?: boolean
}

export default function PriceCard({ title, value, icon, footer, trend, isLoading = false }: PriceCardProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="text-sm font-medium text-zinc-400">{title}</div>
        <div className="rounded-full bg-zinc-800 p-1">{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-24 bg-zinc-800 animate-pulse rounded"></div>
        ) : (
          <div className="text-2xl font-bold flex items-center">
            {value}
            {trend && (
              <span
                className={cn("ml-2 flex items-center text-sm", trend === "up" ? "text-emerald-500" : "text-red-500")}
              >
                {trend === "up" ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
              </span>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <p className="text-xs text-zinc-500">{footer}</p>
      </CardFooter>
    </Card>
  )
}
