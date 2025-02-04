"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { useSpreadsheet } from "@/hooks/useSpreadsheet"
import type { SpreadsheetProps, Cell } from "@/types/spreadsheet"
import { ColumnMenu } from "./column-menu"
import { RunButton } from "./run-button"
import { InlineRunButton } from "./inline-run-button"
import { toast } from "sonner"
import axios from "axios"
import { LoadingCell } from "./loading-cell"

export default function Spreadsheet({ initialData = [] }: SpreadsheetProps) {
  const { data, setData, selection, setSelection, isDragging, setIsDragging, copySelection, pasteSelection } =
    useSpreadsheet()

  const [activeColumn, setActiveColumn] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [columnActions, setColumnActions] = useState<Record<string, string>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]

  const handleColumnAction = (action: string, column: string) => {
    setColumnActions((prev) => ({
      ...prev,
      [column]: action,
    }))
    setActiveColumn(action)
    toast.info(`Selected action: ${action}`)
  }

  const handleRun = async () => {
    if (!selection.start || !selection.end) {
      toast.error("Please select cells")
      return
    }

    const startRow = Math.min(selection.start.row, selection.end.row)
    const endRow = Math.max(selection.start.row, selection.end.row)
    const startCol = Math.min(selection.start.col, selection.end.col)
    const endCol = Math.max(selection.start.col, selection.end.col)

    setIsProcessing(true)

    // Create a map of selected columns and their actions
    const selectedColumns = new Set()
    for (let col = startCol; col <= endCol; col++) {
      const columnLetter = columns[col]
      const action = columnActions[columnLetter]
      if (action) {
        selectedColumns.add(col)
      }
    }

    if (selectedColumns.size === 0) {
      toast.error("Please select an action for at least one column")
      setIsProcessing(false)
      return
    }

    // Set loading state for all selected cells
    const newData = [...data]
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        if (selectedColumns.has(col)) {
          newData[row][col] = {
            ...newData[row][col],
            isLoading: true,
          }
        }
      }
    }
    setData(newData)

    // Process each cell concurrently
    const promises = []
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        if (selectedColumns.has(col)) {
          const query = data[row][0].value // Value from column A
          const columnHeader = data[0][col].value // Header of the selected column
          const promise = axios
            .post("/api/websearch", {
              query,
              column: columnHeader,
            })
            .then((response) => {
              const result = response.data.result
              setData((prevData) => {
                const newData = [...prevData]
                newData[row][col] = {
                  value: result,
                  isEditing: false,
                  isHeader: false,
                  isLoading: false,
                }
                return newData
              })
            })
            .catch((error) => {
              console.error("Error in API call:", error)
              toast.error(`Failed to update row ${row}, column ${columns[col]}`)
              setData((prevData) => {
                const newData = [...prevData]
                newData[row][col] = {
                  ...newData[row][col],
                  isLoading: false,
                }
                return newData
              })
            })
          promises.push(promise)
        }
      }
    }

    await Promise.allSettled(promises)
    setIsProcessing(false)
    toast.success("All selected cells have been processed")
  }

  const handleCellClick = (row: number, col: number) => {
    if (row === 0) {
      const newData = [...data]
      newData[row][col].isEditing = true
      setData(newData)
      return
    }

    if (selection.start?.row === row && selection.start?.col === col) {
      const newData = [...data]
      newData[row][col].isEditing = true
      setData(newData)
    } else {
      const newData = data.map((row) => row.map((cell) => ({ ...cell, isEditing: false })))
      setData(newData)
      setSelection({
        start: { row, col },
        end: { row, col },
      })
    }
  }

  const handleMouseDown = (row: number, col: number) => {
    if (row === 0) return // Prevent selection of header row

    setIsDragging(true)
    setSelection({
      start: { row, col },
      end: { row, col },
    })
  }

  const handleMouseEnter = (row: number, col: number) => {
    if (isDragging && selection.start && row > 0) {
      // Only allow selection below header
      setSelection({
        ...selection,
        end: { row, col },
      })
    }
  }

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    logSelectedCells()
  }, [setIsDragging])

  const handleCellChange = (row: number, col: number, value: string) => {
    const newData = [...data]
    newData[row][col] = {
      value,
      isEditing: true,
      isHeader: row === 0,
    }
    setData(newData)
  }

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const newData = [...data]
      newData[row][col].isEditing = false
      setData(newData)
      if (row + 1 < data.length && row !== 0) {
        setSelection({
          start: { row: row + 1, col },
          end: { row: row + 1, col },
        })
      }
    }
  }

  const handleBlur = (row: number, col: number) => {
    const newData = [...data]
    newData[row][col].isEditing = false
    setData(newData)
  }

  const isCellSelected = (row: number, col: number) => {
    if (!selection.start || !selection.end || row === 0) return false // Never show selection on header row

    const startRow = Math.min(selection.start.row, selection.end.row)
    const endRow = Math.max(selection.start.row, selection.end.row)
    const startCol = Math.min(selection.start.col, selection.end.col)
    const endCol = Math.max(selection.start.col, selection.end.col)

    return row >= startRow && row <= endRow && col >= startCol && col <= endCol
  }

  const getSelectionEndCell = () => {
    if (!selection.start || !selection.end) return null

    const endRow = Math.max(selection.start.row, selection.end.row)
    const endCol = Math.max(selection.start.col, selection.end.col)

    return { row: endRow, col: endCol }
  }

  const logSelectedCells = useCallback(() => {
    if (!selection.start || !selection.end) return

    const startRow = Math.min(selection.start.row, selection.end.row)
    const endRow = Math.max(selection.start.row, selection.end.row)
    const startCol = Math.min(selection.start.col, selection.end.col)
    const endCol = Math.max(selection.start.col, selection.end.col)

    const selectedCells: Cell[][] = []

    for (let i = startRow; i <= endRow; i++) {
      const row: Cell[] = []
      for (let j = startCol; j <= endCol; j++) {
        row.push(data[i][j])
      }
      selectedCells.push(row)
    }

    console.log("Selected cells:", selectedCells)
  }, [data, selection])

  useEffect(() => {
    if (selection.start && data[selection.start.row]?.[selection.start.col]?.isEditing) {
      inputRef.current?.focus()
    }
  }, [selection, data])

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp)
    return () => document.removeEventListener("mouseup", handleMouseUp)
  }, [handleMouseUp])

  const selectionEnd = getSelectionEndCell()

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
              {/* Empty corner cell */}
            </div>
            {columns.map((col, index) => (
              <div
                key={col}
                className="flex items-center justify-between w-32 h-8 px-2 border-r border-gray-200 bg-gray-50 text-sm font-medium text-gray-600"
              >
                <div className="flex items-center min-w-0">
                  <span className="mr-2">{col}</span>
                  <ColumnMenu
                    column={col}
                    selectedAction={columnActions[col]}
                    onSelect={(action) => handleColumnAction(action, col)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div>
          {data.map((row, rowIndex) => (
            <div key={rowIndex} className="flex border-b border-gray-200">
              {/* Row number - starts from 1 after header row */}
              <div className="flex items-center justify-center w-12 border-r border-gray-200 bg-gray-50 text-sm text-gray-600">
                {rowIndex === 0 ? "" : rowIndex}
              </div>
              {/* Cells */}
              {row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={cn(
                    "w-32 h-8 border-r border-gray-200 relative select-none",
                    rowIndex === 0 && "font-medium bg-gray-50",
                    isCellSelected(rowIndex, colIndex) && !cell.isEditing && "bg-blue-50",
                    selection.start?.row === rowIndex &&
                      selection.start?.col === colIndex &&
                      "outline outline-2 outline-blue-500",
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
                    <div className="px-2 py-1 text-sm truncate">{cell.isLoading ? <LoadingCell /> : cell.value}</div>
                  )}
                  {/* Show Run button next to the last selected cell */}
                  {selectionEnd &&
                    rowIndex === selectionEnd.row &&
                    colIndex === selectionEnd.col &&
                    !cell.isEditing && <InlineRunButton onClick={handleRun} isLoading={isProcessing} />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

