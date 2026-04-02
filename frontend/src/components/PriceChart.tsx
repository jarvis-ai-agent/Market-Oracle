import { useQuery } from "@tanstack/react-query"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { formatPrice, formatVolume } from "@/lib/utils"
import type { OHLCVBar } from "@/lib/types"

interface PriceChartProps {
  symbol: string
}

interface TooltipPayload {
  name: string
  value: number
  color?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

function PriceTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="bg-[#111113] border border-[#1f1f23] rounded-lg p-3 shadow-xl">
      <p className="text-xs text-[#71717a] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span className="text-[#71717a]">{p.name}:</span>
          <span className="font-mono font-semibold" style={{ color: p.color || "#f4f4f5" }}>
            {p.name === "Volume" ? formatVolume(p.value) : `$${formatPrice(p.value)}`}
          </span>
        </div>
      ))}
    </div>
  )
}

export function PriceChart({ symbol }: PriceChartProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["ohlcv", symbol],
    queryFn: () => api.getOHLCV(symbol),
    staleTime: 2 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <Card className="bg-[#111113] border-[#1f1f23] h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-16 w-full mt-2" />
        </CardContent>
      </Card>
    )
  }

  if (isError || !data) {
    return (
      <Card className="bg-[#111113] border-[#1f1f23] h-full">
        <CardContent className="flex items-center justify-center h-64">
          <Alert variant="destructive" className="border-[#ef4444]/30 bg-[#ef4444]/10 max-w-sm">
            <AlertDescription className="flex items-center justify-between gap-3">
              <span>Failed to load price data.</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((bar: OHLCVBar) => ({
    date: bar.date,
    close: bar.close,
    volume: bar.volume,
    open: bar.open,
    high: bar.high,
    low: bar.low,
  }))

  const prices = data.map((b) => b.close)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice
  const firstClose = data[0]?.close ?? 0
  const lastClose = data[data.length - 1]?.close ?? 0
  const isUp = lastClose >= firstClose
  const strokeColor = isUp ? "#22c55e" : "#ef4444"

  return (
    <Card className="bg-[#111113] border-[#1f1f23] h-full">
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-sm font-semibold text-[#f4f4f5]">
          Price Chart — {symbol}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#71717a", fontSize: 10, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tickFormatter={(v: string) => v.slice(5)}
            />
            <YAxis
              domain={[minPrice - priceRange * 0.02, maxPrice + priceRange * 0.02]}
              tick={{ fill: "#71717a", fontSize: 10, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={false}
              width={60}
              tickFormatter={(v: number) => `$${formatPrice(v)}`}
            />
            <Tooltip content={<PriceTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              name="Close"
              stroke={strokeColor}
              strokeWidth={1.5}
              fill="url(#priceGrad)"
              dot={false}
              activeDot={{ r: 3, fill: strokeColor }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Volume bars */}
        <ResponsiveContainer width="100%" height={56}>
          <ComposedChart data={chartData} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip
              content={({ active, payload, label }) => (
                active && payload && payload.length > 0 ? (
                  <div className="bg-[#111113] border border-[#1f1f23] rounded p-2 text-xs">
                    <p className="text-[#71717a]">{label}</p>
                    <p className="font-mono text-[#f4f4f5]">Vol: {formatVolume(payload[0]?.value as number)}</p>
                  </div>
                ) : null
              )}
            />
            <Bar dataKey="volume" name="Volume" fill="#6366f1" opacity={0.5} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


