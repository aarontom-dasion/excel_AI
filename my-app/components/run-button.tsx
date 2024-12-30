'use client'

import { Button } from "@/components/ui/button"
import { Play } from 'lucide-react'

interface RunButtonProps {
  onClick: () => void
  isLoading?: boolean
}

export function RunButton({ onClick, isLoading = false }: RunButtonProps) {
  return (
    <Button 
      size="sm" 
      onClick={onClick}
      disabled={isLoading}
      className="bg-blue-500 hover:bg-blue-600 text-white rounded-md px-4 py-1 text-sm font-medium flex items-center gap-1"
    >
      Run
      <Play className="h-3 w-3" />
    </Button>
  )
}

