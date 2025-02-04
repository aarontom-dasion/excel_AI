"use client"

import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InlineRunButtonProps {
  onClick: () => void
  isLoading?: boolean
}

export function InlineRunButton({ onClick, isLoading = false }: InlineRunButtonProps) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      disabled={isLoading}
      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full ml-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-1 text-sm font-medium flex items-center gap-1 z-20"
    >
      Run
      <Play className="h-3 w-3" />
    </Button>
  )
}

