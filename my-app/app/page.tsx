import Spreadsheet from '@/components/spreadsheet'
import { Toaster } from 'sonner'

export default function Page() {
  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="mx-auto max-w-full overflow-x-auto">
        <Spreadsheet />
      </div>
      <Toaster position="bottom-right" />
    </div>
  )
}

