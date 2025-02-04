"use client"

import { useState, useEffect } from "react"
import type { Cell, Selection } from "@/types/spreadsheet"

export function useSpreadsheet(storageKey = "spreadsheet-data") {
  // Initialize data from localStorage or default
  const [data, setData] = useState<Cell[][]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return [
      // Header row with editable cells
      [
        { value: "Company", isEditing: false, isHeader: true },
        { value: "Revenue in 2024", isEditing: false, isHeader: true },
        { value: "CEO", isEditing: false, isHeader: true },
        { value: "", isEditing: false, isHeader: true },
        { value: "", isEditing: false, isHeader: true },
        { value: "", isEditing: false, isHeader: true },
        { value: "", isEditing: false, isHeader: true },
        { value: "", isEditing: false, isHeader: true },
        { value: "", isEditing: false, isHeader: true },
        { value: "", isEditing: false, isHeader: true },
        { value: "", isEditing: false, isHeader: true },
        { value: "", isEditing: false, isHeader: true },
      ],
      // Data rows
      ["Microsoft", "", "", "", "", "", "", "", "", "", "", ""],
      ["Nvidia", "", "", "", "", "", "", "", "", "", "", ""],
      ["CapGo.AI", "", "", "", "", "", "", "", "", "", "", ""],
      ["Apple Inc", "", "", "", "", "", "", "", "", "", "", ""],
      ["SimilarWeb", "", "", "", "", "", "", "", "", "", "", ""],
      ...Array(14).fill(Array(12).fill("")),
    ].map((row, rowIndex) =>
      row.map((cell) =>
        typeof cell === "string" ? { value: cell, isEditing: false, isHeader: rowIndex === 0 } : cell,
      ),
    )
  })

  const [selection, setSelection] = useState<Selection>({
    start: null,
    end: null,
  })

  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data))
  }, [data, storageKey])

  const copySelection = () => {
    if (!selection.start || !selection.end) return

    const startRow = Math.min(selection.start.row, selection.end.row)
    const endRow = Math.max(selection.start.row, selection.end.row)
    const startCol = Math.min(selection.start.col, selection.end.col)
    const endCol = Math.max(selection.start.col, selection.end.col)

    const selectedData = data
      .slice(startRow, endRow + 1)
      .map((row) =>
        row
          .slice(startCol, endCol + 1)
          .map((cell) => cell.value)
          .join("\t"),
      )
      .join("\n")

    navigator.clipboard.writeText(selectedData)
  }

  const pasteSelection = async () => {
    if (!selection.start) return
    if (selection.start.row === 0) return // Prevent pasting in header row

    try {
      const text = await navigator.clipboard.readText()
      const rows = text.split("\n")
      const newData = [...data]

      rows.forEach((row, rowIndex) => {
        const cells = row.split("\t")
        cells.forEach((cell, colIndex) => {
          const targetRow = selection.start!.row + rowIndex
          const targetCol = selection.start!.col + colIndex

          if (targetRow < data.length && targetCol < data[0].length && targetRow > 0) {
            newData[targetRow][targetCol] = {
              value: cell,
              isEditing: false,
              isHeader: false,
            }
          }
        })
      })

      setData(newData)
    } catch (err) {
      console.error("Failed to paste:", err)
    }
  }

  return {
    data,
    setData,
    selection,
    setSelection,
    isDragging,
    setIsDragging,
    copySelection,
    pasteSelection,
  }
}

