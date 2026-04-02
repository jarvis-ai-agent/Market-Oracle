import { useQuery } from "@tanstack/react-query"
import { ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/api"
import type { NewsArticle } from "@/lib/types"
import { cn } from "@/lib/utils"

interface NewsFeedProps {
  symbol: string
}

function getSentimentClass(label: string): string {
  const l = label.toLowerCase()
  if (l.includes("bull") || l === "positive") return "text-[#22c55e] border-[#22c55e]/40 bg-[#22c55e]/10"
  if (l.includes("bear") || l === "negative") return "text-[#ef4444] border-[#ef4444]/40 bg-[#ef4444]/10"
  return "text-[#71717a] border-[#1f1f23] bg-[#1f1f23]"
}

function parseAVDate(dateStr: string): Date {
  // AlphaVantage format: "20260402T160945" → "2026-04-02T16:09:45"
  const s = dateStr.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/, "$1-$2-$3T$4:$5:$6")
  return new Date(s)
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = parseAVDate(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffH = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffH < 1) return "Just now"
    if (diffH < 24) return `${diffH}h ago`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 7) return `${diffD}d ago`
    return date.toLocaleDateString()
  } catch {
    return dateStr
  }
}

export function NewsFeed({ symbol }: NewsFeedProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["news", symbol],
    queryFn: () => api.getNews(symbol),
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <Card className="bg-[#111113] border-[#1f1f23] h-full">
        <CardHeader className="pb-2"><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
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
              <span>Failed to load news.</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const agg = data.aggregateSentiment

  return (
    <Card className="bg-[#111113] border-[#1f1f23] h-full flex flex-col">
      <CardHeader className="pb-2 px-4 pt-4 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-[#f4f4f5]">
            News — {symbol}
          </CardTitle>
          {agg && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#71717a]">Sentiment:</span>
              <Badge
                variant="outline"
                className={cn("text-xs", getSentimentClass(agg.label))}
              >
                {agg.label}
              </Badge>
              <span className="font-mono text-xs text-[#71717a]">
                {agg.count} articles
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0 flex-1 min-h-0">
        <ScrollArea className="h-[340px]">
          <div className="px-4 pb-4 space-y-0">
            {data.articles.map((article: NewsArticle, i: number) => (
              <div key={i}>
                {i > 0 && <Separator className="bg-[#1f1f23] my-2" />}
                <div className="py-2">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#f4f4f5] hover:text-[#6366f1] transition-colors leading-snug flex-1"
                    >
                      {article.title}
                      <ExternalLink className="inline h-3 w-3 ml-1 opacity-50" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[#71717a]">{article.source}</span>
                    <span className="text-xs text-[#71717a]">·</span>
                    <span className="text-xs text-[#71717a]">{formatRelativeTime(article.publishedAt)}</span>
                    {article.tickerSentimentLabel && (
                      <Badge
                        variant="outline"
                        className={cn("text-xs h-4 px-1.5", getSentimentClass(article.tickerSentimentLabel))}
                      >
                        {article.tickerSentimentLabel}
                      </Badge>
                    )}
                  </div>
                  {article.summary && (
                    <p className="text-xs text-[#71717a] mt-1 line-clamp-2">{article.summary}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
