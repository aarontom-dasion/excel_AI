'use client'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Search, Mail, LinkedinIcon, AlertCircle, Play, FileSearch, Bot } from 'lucide-react'

interface ColumnMenuProps {
  column: string
  onSelect: (action: string, column: string) => void
}

export function ColumnMenu({ column, onSelect }: ColumnMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-4 w-4">
          <ChevronDown className="h-3 w-3" />
          <span className="sr-only">Open column menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onSelect('websearch', column)}>
            <div className="flex items-center justify-between w-full">
              <span>Web Search</span>
              <Search className="h-4 w-4 text-blue-500" />
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSelect('detailedsearch', column)}>
            <div className="flex items-center justify-between w-full">
              <span>Detailed Search</span>
              <Search className="h-4 w-4 text-blue-500" />
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSelect('newsweek', column)}>
            <div className="flex items-center justify-between w-full">
              <span>News Search (1 Week)</span>
              <Search className="h-4 w-4 text-blue-500" />
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSelect('newsmonth', column)}>
            <div className="flex items-center justify-between w-full">
              <span>News Search (1 Month)</span>
              <Search className="h-4 w-4 text-blue-500" />
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onSelect('gpt4', column)}>
            <div className="flex items-center justify-between w-full">
              <span>GPT-4o</span>
              <Bot className="h-4 w-4 text-purple-500" />
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSelect('people', column)}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <span>Get People Info (LinkedIn, Email)</span>
              </div>
              <div className="flex gap-1">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <LinkedinIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSelect('email', column)}>
            <div className="flex items-center justify-between w-full">
              <span>Get Email Address</span>
              <Mail className="h-4 w-4 text-orange-500" />
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSelect('verifyemail', column)}>
            <div className="flex items-center justify-between w-full">
              <span>Verify Email</span>
              <Mail className="h-4 w-4 text-orange-500" />
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onSelect('concat', column)} className="text-muted-foreground italic">
            {'<blank>'}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onSelect('advancedweb', column)}>
            <div className="flex items-center justify-between w-full">
              <span>Advanced Web Search</span>
              <FileSearch className="h-4 w-4" />
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSelect('advancedpdf', column)}>
            <div className="flex items-center justify-between w-full">
              <span>Advanced PDF Search</span>
              <FileSearch className="h-4 w-4" />
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

