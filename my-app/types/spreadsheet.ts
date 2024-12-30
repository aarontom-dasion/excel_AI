export interface Cell {
  value: string
  isEditing: boolean
}

export interface Selection {
  start: { row: number; col: number } | null
  end: { row: number; col: number } | null
}

export interface SpreadsheetProps {
  initialData?: string[][]
}

