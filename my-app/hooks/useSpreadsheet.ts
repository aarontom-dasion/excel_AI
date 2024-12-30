'use client'

import { useState, useEffect } from 'react'
import { Cell, Selection } from '@/types/spreadsheet'

export function useSpreadsheet(storageKey: string = 'spreadsheet-data') {
  // Initialize data from localStorage or default
  const [data, setData] = useState<Cell[][]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        return JSON.parse(saved)
      }
    }
    return [
      ['Company', 'Revenue in 2024', 'CEO', '', '', '', '', '', '', '', '', ''],
      ['Microsoft', '', '', '', '', '', '', '', '', '', '', ''],
      ['Nvidia', '', '', '', '', '', '', '', '', '', '', ''],
      ['CapGo.AI', '', '', '', '', '', '', '', '', '', '', ''],
      ['Apple Inc', '', '', '', '', '', '', '', '', '', '', ''],
      ['SimilarWeb', '', '', '', '', '', '', '', '', '', '', ''],
      ...Array(14).fill(Array(12).fill(''))
    ].map(row => row.map(cell => ({ value: cell, isEditing: false })))
  })

  const [selection, setSelection] = useState<Selection>({
    start: null,
    end: null,
  })

  const [isDragging, setIsDragging] = useState(false)

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data))
  }, [data, storageKey])

  // Copy selected cells
  const copySelection = () => {
    if (!selection.start || !selection.end) return

    const startRow = Math.min(selection.start.row, selection.end.row)
    const endRow = Math.max(selection.start.row, selection.end.row)
    const startCol = Math.min(selection.start.col, selection.end.col)
    const endCol = Math.max(selection.start.col, selection.end.col)

    const selectedData = data
      .slice(startRow, endRow + 1)
      .map(row => 
        row.slice(startCol, endCol + 1)
          .map(cell => cell.value)
          .join('\t')
      )
      .join('\n')

    navigator.clipboard.writeText(selectedData)
  }

  // Paste cells
  const pasteSelection = async () => {
    if (!selection.start) return

    try {
      const text = await navigator.clipboard.readText()
      const rows = text.split('\n')
      const newData = [...data]

      rows.forEach((row, rowIndex) => {
        const cells = row.split('\t')
        cells.forEach((cell, colIndex) => {
          const targetRow = selection.start!.row + rowIndex
          const targetCol = selection.start!.col + colIndex
          
          if (targetRow < data.length && targetCol < data[0].length) {
            newData[targetRow][targetCol] = {
              value: cell,
              isEditing: false
            }
          }
        })
      })

      setData(newData)
    } catch (err) {
      console.error('Failed to paste:', err)
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'c') {
        e.preventDefault()
        copySelection()
      } else if (e.key === 'v') {
        e.preventDefault()
        pasteSelection()
      }
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selection, data])

  return {
    data,
    setData,
    selection,
    setSelection,
    isDragging,
    setIsDragging,
    copySelection,
    pasteSelection
  }
}

