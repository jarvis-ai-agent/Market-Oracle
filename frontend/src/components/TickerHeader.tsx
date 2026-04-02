import { useQuery } from "@tanstack/react-query"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/api"
import { formatPrice, formatPct, formatLargeNumber, formatNullable, formatPctAbs } from "@/lib/utils"

interface TickerHeaderProps {
  symbol: string
}

export function TickerHeader({ symbol }: TickerHeaderProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["overview", symbol],
    queryFn: () => api.getOverview(symbol),
    staleTime: 60 * 1000,
  })

  if (isLoading) {
    return (
      <Card className="bg-[#111113] border-[#1f1f23]">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-10 w-32" />
            <div className="flex gap-4 flex-wrap">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-24" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError || !data) {
    return (
      <Alert variant="destructive" className="border-[#ef4444]/30 bg-[#ef4444]/10">
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load {symbol} overview.</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
        </AlertDescription>
      </Alert>
    )
  }

  const isPositive = data.change >= 0
  const totalAnalysts = data.analystRatingBuy + data.analystRatingHold + data.analystRatingSell

  return (
    <Card className="bg-[#111113] border-[#1f1f23]">
      <CardContent className="p-6 space-y-4">
        {/* Name + badges */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold text-[#f4f4f5]">{data.name}</h1>
            <Badge variant="outline" className="font-mono text-xs border-[#6366f1] text-[#6366f1]">
              {data.symbol}
            </Badge>
            {data.exchange && (
              <Badge variant="outline" className="text-xs border-[#1f1f23] text-[#71717a]">
                {data.exchange}
              </Badge>
            )}
            {data.sector && (
              <Badge variant="outline" className="text-xs border-[#1f1f23] text-[#71717a]">
                {data.sector}
              </Badge>
            )}
          </div>
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-4xl font-bold text-[#f4f4f5]">
            {data.currency === "USD" ? "$" : ""}{formatPrice(data.price)}
          </span>
          <div className={`flex items-center gap-1 font-mono text-lg font-semibold ${isPositive ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
            {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            <span>{isPositive ? "+" : ""}{formatPrice(data.change)}</span>
            <span>({formatPct(data.changePct)})</span>
          </div>
        </div>

        <Separator className="bg-[#1f1f23]" />

        {/* Stats row */}
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {[
            { label: "Mkt Cap", value: formatLargeNumber(data.marketCap) },
            { label: "P/E", value: formatNullable(data.pe) },
            { label: "Fwd P/E", value: formatNullable(data.forwardPE) },
            { label: "EV/EBITDA", value: formatNullable(data.evToEbitda) },
            { label: "P/B", value: formatNullable(data.priceToBook) },
            { label: "Beta", value: formatNullable(data.beta) },
            { label: "52W High", value: `$${formatPrice(data.high52week)}` },
            { label: "52W Low", value: `$${formatPrice(data.low52week)}` },
            { label: "Div Yield", value: data.dividendYield != null ? formatPctAbs(data.dividendYield * 100) : "—" },
            { label: "Volume", value: formatLargeNumber(data.volume) },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs text-[#71717a]">{label}</span>
              <span className="font-mono text-sm font-medium text-[#f4f4f5]">{value}</span>
            </div>
          ))}
        </div>

        {/* Analyst bar */}
        {totalAnalysts > 0 && (
          <>
            <Separator className="bg-[#1f1f23]" />
            <div className="flex items-center gap-4">
              <span className="text-xs text-[#71717a]">Analyst Ratings</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono font-semibold text-[#22c55e]">{data.analystRatingBuy}</span>
                  <span className="text-xs text-[#71717a]">Buy</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono font-semibold text-[#f59e0b]">{data.analystRatingHold}</span>
                  <span className="text-xs text-[#71717a]">Hold</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-mono font-semibold text-[#ef4444]">{data.analystRatingSell}</span>
                  <span className="text-xs text-[#71717a]">Sell</span>
                </div>
              </div>
              {/* Visual bar */}
              <div className="flex-1 max-w-xs flex h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#22c55e]"
                  style={{ width: `${(data.analystRatingBuy / totalAnalysts) * 100}%` }}
                />
                <div
                  className="bg-[#f59e0b]"
                  style={{ width: `${(data.analystRatingHold / totalAnalysts) * 100}%` }}
                />
                <div
                  className="bg-[#ef4444]"
                  style={{ width: `${(data.analystRatingSell / totalAnalysts) * 100}%` }}
                />
              </div>
              {data.analystTargetPrice && (
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-xs text-[#71717a]">Target:</span>
                  <span className="font-mono text-xs font-semibold text-[#f4f4f5]">
                    ${formatPrice(data.analystTargetPrice)}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
