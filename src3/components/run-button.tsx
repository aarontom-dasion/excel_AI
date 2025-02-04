"use client"

interface RunButtonProps {
  onClick: () => void
  isLoading?: boolean
}

export default function RunButton({ onClick, isLoading = false }: RunButtonProps) {
  // ... (component code)
}

