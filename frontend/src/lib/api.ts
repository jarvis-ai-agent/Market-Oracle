import type {
  TickerOverview,
  OHLCVBar,
  VolatilityData,
  TechnicalIndicators,
  NewsData,
  MacroData,
  SearchResult,
} from "./types"

const BASE_URL = "https://market-oracle-api-production.up.railway.app"

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  getOverview: (symbol: string) =>
    fetchJSON<TickerOverview>(`${BASE_URL}/api/ticker/${symbol}/overview`),

  getOHLCV: (symbol: string) =>
    fetchJSON<OHLCVBar[]>(`${BASE_URL}/api/ticker/${symbol}/ohlcv?outputsize=compact`),

  getVolatility: (symbol: string) =>
    fetchJSON<VolatilityData>(`${BASE_URL}/api/ticker/${symbol}/volatility?horizon=5`),

  getTechnicals: (symbol: string) =>
    fetchJSON<TechnicalIndicators>(`${BASE_URL}/api/ticker/${symbol}/technicals`),

  getNews: (symbol: string) =>
    fetchJSON<NewsData>(`${BASE_URL}/api/ticker/${symbol}/news?limit=20`),

  getMacro: () =>
    fetchJSON<MacroData>(`${BASE_URL}/api/macro`),

  search: (query: string) =>
    fetchJSON<SearchResult[]>(`${BASE_URL}/api/search?q=${encodeURIComponent(query)}`),
}
