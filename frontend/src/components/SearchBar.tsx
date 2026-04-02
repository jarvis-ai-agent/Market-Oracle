import { useState, useCallback, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { api } from "@/lib/api"
import type { SearchResult } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  onSelect: (symbol: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export function SearchBar({ onSelect, placeholder = "Search ticker or company...", className, autoFocus }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: results, isFetching } = useQuery({
    queryKey: ["search", query],
    queryFn: () => api.search(query),
    enabled: query.length >= 1,
    staleTime: 30 * 1000,
  })

  const handleSelect = useCallback((symbol: string) => {
    setQuery("")
    setOpen(false)
    onSelect(symbol)
  }, [onSelect])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      handleSelect(query.trim().toUpperCase())
    }
  }, [query, handleSelect])

  return (
    <div className={cn("relative", className)}>
      <Command className="bg-[#111113] border border-[#1f1f23] rounded-lg overflow-visible">
        <div className="flex items-center px-3 gap-2">
          <Search className="h-4 w-4 text-[#71717a] shrink-0" />
          <CommandInput
            ref={inputRef}
            value={query}
            onValueChange={(val: string) => {
              setQuery(val)
              setOpen(val.length > 0)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length > 0 && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="flex-1 bg-transparent border-none outline-none text-[#f4f4f5] placeholder:text-[#71717a] text-sm py-2 font-sans h-auto"
          />
        </div>
        {open && (
          <CommandList className="absolute top-full left-0 right-0 z-50 bg-[#111113] border border-[#1f1f23] rounded-lg mt-1 shadow-2xl max-h-64 overflow-y-auto">
            {isFetching && (
              <div className="px-4 py-2 text-xs text-[#71717a]">Searching…</div>
            )}
            {!isFetching && results && results.length === 0 && (
              <CommandEmpty className="py-4 text-center text-sm text-[#71717a]">No results found.</CommandEmpty>
            )}
            {results && results.length > 0 && (
              <CommandGroup>
                {results.slice(0, 8).map((r: SearchResult) => (
                  <CommandItem
                    key={r.symbol}
                    value={r.symbol}
                    onSelect={() => handleSelect(r.symbol)}
                    className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#1f1f23] text-[#f4f4f5]"
                  >
                    <span className="font-mono text-sm font-semibold text-[#6366f1] w-16 shrink-0">
                      {r.symbol}
                    </span>
                    <span className="text-sm text-[#71717a] truncate">{r.name}</span>
                    <span className="ml-auto text-xs text-[#71717a] shrink-0">{r.type}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  )
}
