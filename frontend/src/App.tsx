import { Routes, Route, useNavigate, useParams } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TopBar } from "./components/TopBar"
import { HomePage } from "./components/HomePage"
import { TickerDashboard } from "./components/TickerDashboard"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function TickerDashboardRoute() {
  const { symbol } = useParams<{ symbol: string }>()
  return <TickerDashboard symbol={symbol ?? ""} />
}

function AppInner() {
  const navigate = useNavigate()

  const handleSelectTicker = (symbol: string) => {
    navigate(`/ticker/${symbol}`)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <TopBar onSelectTicker={handleSelectTicker} />
      <Routes>
        <Route path="/" element={<HomePage onSelectTicker={handleSelectTicker} />} />
        <Route path="/ticker/:symbol" element={<TickerDashboardRoute />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  )
}
