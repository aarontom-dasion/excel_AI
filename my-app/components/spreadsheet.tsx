'use client'

import { useRef, useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSpreadsheet } from '@/hooks/useSpreadsheet'
import { SpreadsheetProps } from '@/types/spreadsheet'
import { ColumnMenu } from './column-menu'
import { RunButton } from './run-button'
import { toast } from 'sonner'

export default function Spreadsheet({ initialData = [] }: SpreadsheetProps) {
  const {
    data,
    setData,
    selection,
    setSelection,
    isDragging,
    setIsDragging,
    copySelection,
    pasteSelection
  } = useSpreadsheet()
  
  const [activeColumn, setActiveColumn] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [columnActions, setColumnActions] = useState<Record<string, string>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

  const handleColumnAction = (action: string, column: string) => {
    setColumnActions(prev => ({
      ...prev,
      [column]: action
    }))
    setActiveColumn(action)
    toast.info(`Selected action: ${action}`)
  }

  const handleRun = () => {
    if (!activeColumn) {
      toast.error('Please select an action first')
      return
    }
    
    setIsProcessing(true)
    // Simulate processing
    setTimeout(() => {
      toast.success(`Executed ${activeColumn} successfully`)
      setIsProcessing(false)
    }, 1500)
  }

  const handleCellClick = (row: number, col: number) => {
    if (selection.start?.row === row && selection.start?.col === col) {
      const newData = [...data]
      newData[row][col].isEditing = true
      setData(newData)
    } else {
      // Reset any editing state
      const newData = data.map(row =>
        row.map(cell => ({ ...cell, isEditing: false }))
      )
      setData(newData)
      setSelection({
        start: { row, col },
        end: { row, col }
      })
    }
  }

  const handleMouseDown = (row: number, col: number) => {
    setIsDragging(true)
    setSelection({
      start: { row, col },
      end: { row, col }
    })
  }

  const handleMouseEnter = (row: number, col: number) => {
    if (isDragging && selection.start) {
      setSelection({
        ...selection,
        end: { row, col }
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleCellChange = (row: number, col: number, value: string) => {
    const newData = [...data]
    newData[row][col] = { value, isEditing: true }
    setData(newData)
  }

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const newData = [...data]
      newData[row][col].isEditing = false
      setData(newData)
      setSelection({
        start: { row: row + 1, col },
        end: { row: row + 1, col }
      })
    }
  }

  const handleBlur = (row: number, col: number) => {
    const newData = [...data]
    newData[row][col].isEditing = false
    setData(newData)
  }

  const isCellSelected = (row: number, col: number) => {
    if (!selection.start || !selection.end) return false

    const startRow = Math.min(selection.start.row, selection.end.row)
    const endRow = Math.max(selection.start.row, selection.end.row)
    const startCol = Math.min(selection.start.col, selection.end.col)
    const endCol = Math.max(selection.start.col, selection.end.col)

    return row >= startRow && row <= endRow && col >= startCol && col <= endCol
  }

  useEffect(() => {
    if (selection.start && data[selection.start.row][selection.start.col].isEditing) {
      inputRef.current?.focus()
    }
  }, [selection, data])

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [])

  return (
    <div className="w-full overflow-x-auto bg-white">
      <div className="min-w-max">
        <div className="sticky top-0 z-10">
          {/* Action Bar */}
          {activeColumn && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 border-b">
              <RunButton onClick={handleRun} isLoading={isProcessing} />
              {isProcessing && <span className="text-sm text-gray-500">Processing...</span>}
            </div>
          )}
          
          {/* Column Headers */}
          <div className="flex border-b border-gray-200">
            <div className="flex items-center justify-center w-12 h-8 border-r border-gray-200 bg-gray-50">
              {/* Row number header */}
            </div>
            {columns.map((col, index) => (
              <div
                key={col}
                className="flex items-center justify-between w-32 h-8 px-2 border-r border-gray-200 bg-gray-50 text-sm font-medium text-gray-600"
              >
                <div className="flex items-center gap-1 overflow-hidden">
                  <span>{col}</span>
                  {columnActions[col] && (
                    <>
                      <span className="text-gray-400 mx-1">•</span>
                      <span className="text-purple-600 truncate">{columnActions[col]}</span>
                    </>
                  )}
                </div>
                <ColumnMenu column={col} onSelect={(action) => handleColumnAction(action, col)} />
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div>
          {data.map((row, rowIndex) => (
            <div key={rowIndex} className="flex border-b border-gray-200">
              {/* Row number */}
              <div className="flex items-center justify-center w-12 border-r border-gray-200 bg-gray-50 text-sm text-gray-600">
                {rowIndex + 1}
              </div>
              {/* Cells */}
              {row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={cn(
                    "w-32 h-8 border-r border-gray-200 relative select-none",
                    isCellSelected(rowIndex, colIndex) && !cell.isEditing && "bg-blue-50",
                    selection.start?.row === rowIndex && selection.start?.col === colIndex && "outline outline-2 outline-blue-500",
                  )}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                >
                  {cell.isEditing ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={cell.value}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                      onBlur={() => handleBlur(rowIndex, colIndex)}
                      className="absolute inset-0 w-full h-full px-2 border-none outline-none bg-white"
                    />
                  ) : (
                    <div className="px-2 py-1 text-sm truncate">
                      {cell.value}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

