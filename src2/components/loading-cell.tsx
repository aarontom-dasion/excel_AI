import { Loader2 } from "lucide-react"

interface LoadingCellProps {
  text?: string
}

export function LoadingCell({ text = "Web Search" }: LoadingCellProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Loader2 className="h-3 w-3 animate-spin" />
      <span>{text}</span>
    </div>
  )
}

