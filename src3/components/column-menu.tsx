"use client"

interface ColumnMenuProps {
  column: string
  selectedAction?: string
  onSelect: (action: string, column: string) => void
}

export default function ColumnMenu({ column, selectedAction, onSelect }: ColumnMenuProps) {
  // ... (component code)
}

