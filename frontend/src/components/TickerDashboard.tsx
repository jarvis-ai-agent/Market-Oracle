import { TickerHeader } from "./TickerHeader"
import { PriceChart } from "./PriceChart"
import { VolatilityPanel } from "./VolatilityPanel"
import { TechnicalsPanel } from "./TechnicalsPanel"
import { FundamentalsPanel } from "./FundamentalsPanel"
import { NewsFeed } from "./NewsFeed"

interface TickerDashboardProps {
  symbol: string
}

export function TickerDashboard({ symbol }: TickerDashboardProps) {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Full-width header */}
      <TickerHeader symbol={symbol} />

      {/* Bento Row 1: Price (60%) + Volatility (40%) */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "3fr 2fr" }}
      >
        <PriceChart symbol={symbol} />
        <VolatilityPanel symbol={symbol} />
      </div>

      {/* Bento Row 2: Technicals (1fr) + Fundamentals (1fr) + News (1fr) */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
      >
        <TechnicalsPanel symbol={symbol} />
        <FundamentalsPanel symbol={symbol} />
        <NewsFeed symbol={symbol} />
      </div>
    </div>
  )
}
