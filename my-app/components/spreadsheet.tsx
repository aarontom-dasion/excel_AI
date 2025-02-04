'use client'

import { useRef, useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSpreadsheet } from '@/hooks/useSpreadsheet'
import { SpreadsheetProps } from '@/types/spreadsheet'
import { ColumnMenu } from './column-menu'
import { RunButton } from './run-button'
import { toast } from 'sonner'

/**
 * Spreadsheet component provides a spreadsheet-like interface
 * with functionalities for cell selection, editing, and executing
 * column-specific actions.
 * 
 * @param {SpreadsheetProps} props - The initial data for the spreadsheet.
 */
export default function Spreadsheet({ initialData = [] }: SpreadsheetProps) {
  // Destructuring state and functions from custom hook
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
  
  // State for managing active column, processing status, and column actions
  const [activeColumn, setActiveColumn] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [columnActions, setColumnActions] = useState<Record<string, string>>({})
  const [highlightedValues, setHighlightedValues] = useState<string[][]>([]);
  
  // Ref for input element to manage focus
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Array representing column headers
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

  /**
   * Handles the selection of an action for a column.
   * Updates the columnActions state and sets the active column.
   * 
   * @param {string} action - The action to be performed.
   * @param {string} column - The column on which the action is performed.
   */
  const handleColumnAction = (action: string, column: string) => {
    setColumnActions(prev => ({
      ...prev,
      [column]: action
    }))
    setActiveColumn(action)
    toast.info(`Selected action: ${action}`)
  }

  /**
   * Executes the action for the active column by sending a POST request.
   * Displays success or error notifications based on the response.
   */
  const handleRun = async () => {
    if (!activeColumn) {
      toast.error('Please select an action first');
      return;
    }
  
    setIsProcessing(true);
  
    try {
      const response = await fetch(`http://localhost:3001/${activeColumn}`, { // Updated port
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: selection,
        }),
      });
  
      const result = await response.json();
      toast.success(`Executed ${activeColumn} successfully: ${result.result}`);
    } catch (error) {
      toast.error('Error processing data');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handles cell click events to toggle editing state or update selection.
   * 
   * @param {number} row - The row index of the clicked cell.
   * @param {number} col - The column index of the clicked cell.
   */
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

  /**
   * Initiates cell selection on mouse down.
   * 
   * @param {number} row - The row index of the cell.
   * @param {number} col - The column index of the cell.
   */
  const handleMouseDown = (row: number, col: number) => {
    setIsDragging(true)
    setSelection({
      start: { row, col },
      end: { row, col }
    })
  }

  /**
   * Updates the selection range when dragging over cells.
   * 
   * @param {number} row - The row index of the cell.
   * @param {number} col - The column index of the cell.
   */
  const handleMouseEnter = (row: number, col: number) => {
    if (isDragging && selection.start) {
      setSelection({
        ...selection,
        end: { row, col }
      })
    }
  }

  /**
   * Ends the dragging state on mouse up.
   */
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  /**
   * Updates the cell value during editing.
   * 
   * @param {number} row - The row index of the cell.
   * @param {number} col - The column index of the cell.
   * @param {string} value - The new value for the cell.
   */
  const handleCellChange = (row: number, col: number, value: string) => {
    const newData = [...data]
    newData[row][col] = { value, isEditing: true }
    setData(newData)
  }

  /**
   * Handles keyboard events, specifically the Enter key, to move to the next row.
   * 
   * @param {React.KeyboardEvent} e - The keyboard event.
   * @param {number} row - The row index of the cell.
   * @param {number} col - The column index of the cell.
   */
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

  /**
   * Ends editing mode when a cell loses focus.
   * 
   * @param {number} row - The row index of the cell.
   * @param {number} col - The column index of the cell.
   */
  const handleBlur = (row: number, col: number) => {
    const newData = [...data]
    newData[row][col].isEditing = false
    setData(newData)
  }

  /**
   * Determines if a cell is within the current selection range.
   * 
   * @param {number} row - The row index of the cell.
   * @param {number} col - The column index of the cell.
   * @returns {boolean} - True if the cell is selected, false otherwise.
   */
  const isCellSelected = (row: number, col: number) => {
    if (!selection.start || !selection.end) return false

    const startRow = Math.min(selection.start.row, selection.end.row)
    const endRow = Math.max(selection.start.row, selection.end.row)
    const startCol = Math.min(selection.start.col, selection.end.col)
    const endCol = Math.max(selection.start.col, selection.end.col)

    return row >= startRow && row <= endRow && col >= startCol && col <= endCol
  }


  /**
   * Retrieves the values of the currently highlighted cells.
   * 
   * @returns {string[][]} - A 2D array of the values of the highlighted cells.
   */
  const getHighlightedValues = (): string[][] => {
    if (!selection.start || !selection.end) return [];

    const startRow = Math.min(selection.start.row, selection.end.row);
    const endRow = Math.max(selection.start.row, selection.end.row);
    const startCol = Math.min(selection.start.col, selection.end.col);
    const endCol = Math.max(selection.start.col, selection.end.col);

    const highlightedValues: string[][] = [];

    for (let row = startRow; row <= endRow; row++) {
      const rowValues: string[] = [];
      for (let col = startCol; col <= endCol; col++) {
        rowValues.push(data[row][col].value);
      }
      highlightedValues.push(rowValues);
    }

    return highlightedValues;
  };

  /**
 * Calls the AI API to get a response based on the provided prompt.
 * 
 * @param {string} prompt - The prompt to send to the AI API.
 * @returns {Promise<string>} - The response from the AI API.
 */
const callAIAPI = async (prompt: string): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/engines/davinci/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      max_tokens: 15,
      temperature: 0,
    }),
  });

  const data = await response.json();
  return data.choices[0].text.trim();
};

const fillWithAI = async () => {
  if (!selection.start || !selection.end) {
    toast.error('Please select a range first');
    return;
  }

  const startRow = Math.min(selection.start.row, selection.end.row);
  const endRow = Math.max(selection.start.row, selection.end.row);
  const startCol = Math.min(selection.start.col, selection.end.col);
  const endCol = Math.max(selection.start.col, selection.end.col);

  const newData = [...data];

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const prompt = `What is the value for cell at row ${row + 1}, column ${col + 1}?`;
      const aiResponse = await callAIAPI(prompt);
      newData[row][col] = { value: aiResponse, isEditing: false };
    }
  }
  setData(newData);
  toast.success('Cells filled with AI data');
};

  // Effect to focus the input when a cell is in editing mode
  useEffect(() => {
    if (selection.start && data[selection.start.row][selection.start.col].isEditing) {
      inputRef.current?.focus()
    }
  }, [selection, data])

  // Effect to add and remove mouseup event listener for drag selection
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
            <button onClick={fillWithAI} className="btn btn-primary">Fill with AI</button>
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