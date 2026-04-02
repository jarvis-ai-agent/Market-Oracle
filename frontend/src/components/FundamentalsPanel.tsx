import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { formatPctAbs, formatPrice, formatLargeNumber } from "@/lib/utils"

interface FundamentalsPanelProps {
  symbol: string
}

export function FundamentalsPanel({ symbol }: FundamentalsPanelProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["overview", symbol],
    queryFn: () => api.getOverview(symbol),
    staleTime: 60 * 1000,
  })

  if (isLoading) {
    return (
      <Card className="bg-[#111113] border-[#1f1f23] h-full">
        <CardHeader className="pb-2"><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (isError || !data) {
    return (
      <Card className="bg-[#111113] border-[#1f1f23] h-full">
        <CardContent className="flex items-center justify-center h-48">
          <Alert variant="destructive" className="border-[#ef4444]/30 bg-[#ef4444]/10 max-w-sm">
            <AlertDescription className="flex items-center justify-between gap-3">
              <span>Failed to load fundamentals.</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const rows = [
    {
      label: "Revenue Growth YOY",
      value: data.revenueGrowthYOY != null ? formatPctAbs(data.revenueGrowthYOY * 100) : "—",
      positive: data.revenueGrowthYOY != null ? data.revenueGrowthYOY > 0 : null,
    },
    {
      label: "Earnings Growth YOY",
      value: data.earningsGrowthYOY != null ? formatPctAbs(data.earningsGrowthYOY * 100) : "—",
      positive: data.earningsGrowthYOY != null ? data.earningsGrowthYOY > 0 : null,
    },
    {
      label: "Profit Margin",
      value: data.profitMargin != null ? formatPctAbs(data.profitMargin * 100) : "—",
      positive: data.profitMargin != null ? data.profitMargin > 0 : null,
    },
    { label: "EPS", value: data.eps != null ? `$${formatPrice(data.eps)}` : "—", positive: data.eps != null ? data.eps > 0 : null },
    {
      label: "Analyst Target",
      value: data.analystTargetPrice != null ? `$${formatPrice(data.analystTargetPrice)}` : "—",
      positive: null,
    },
    { label: "Market Cap", value: formatLargeNumber(data.marketCap), positive: null },
    { label: "MA50", value: data.ma50 != null ? `$${formatPrice(data.ma50)}` : "—", positive: null },
    { label: "MA200", value: data.ma200 != null ? `$${formatPrice(data.ma200)}` : "—", positive: null },
    {
      label: "Next Earnings",
      value: data.nextEarnings ?? "—",
      positive: null,
    },
  ]

  return (
    <Card className="bg-[#111113] border-[#1f1f23] h-full">
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-sm font-semibold text-[#f4f4f5]">
          Fundamentals — {symbol}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-0">
          {rows.map(({ label, value, positive }, i) => (
            <div
              key={label}
              className={`flex items-center justify-between py-2 ${i < rows.length - 1 ? "border-b border-[#1f1f23]" : ""}`}
            >
              <span className="text-xs text-[#71717a]">{label}</span>
              <span
                className={`font-mono text-sm font-medium ${
                  positive === true ? "text-[#22c55e]" :
                  positive === false ? "text-[#ef4444]" :
                  "text-[#f4f4f5]"
                }`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
