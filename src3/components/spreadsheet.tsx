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

  // ... (rest of the component code)

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
          const action = columnActions[columns[col]]

          let promise
          switch (action) {
            case "Web Search":
              promise = axios.post("/api/websearch", { query, column: columnHeader })
              break
            case "GPT-4o":
              promise = axios.post("/api/gpt4o", { query, column: columnHeader })
              break
            case "Get Email Address":
              promise = axios.post("/api/emailsearch", { query })
              break
            default:
              continue // Skip if no valid action
          }

          promise = promise
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
              console.error(`Error in ${action}:`, error)
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

  // ... (rest of the component code)

  return (
    // ... (component JSX)
  )
}

