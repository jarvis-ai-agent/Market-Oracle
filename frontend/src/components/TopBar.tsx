import { SearchBar } from "./SearchBar"
import { MacroPills } from "./MacroPills"

interface TopBarProps {
  onSelectTicker: (symbol: string) => void
}

export function TopBar({ onSelectTicker }: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#1f1f23] bg-[#0a0a0b]/95 backdrop-blur-sm">
      <div className="flex items-center gap-4 px-6 h-14">
        {/* Logo */}
        <div className="flex-shrink-0">
          <span className="font-mono text-sm font-bold tracking-widest">
            <span className="text-[#f4f4f5]">MARKET </span>
            <span className="text-[#6366f1]">ORACLE</span>
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-auto">
          <SearchBar onSelect={onSelectTicker} />
        </div>

        {/* Macro pills */}
        <div className="flex-shrink-0">
          <MacroPills />
        </div>
      </div>
    </header>
  )
}
