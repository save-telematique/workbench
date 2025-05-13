import React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { fr } from "date-fns/locale";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "./popover";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/utils/translation";

interface DatePickerProps {
  date: Date;
  onSelect: (date: Date) => void;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({ 
  date, 
  onSelect,
  disabled = false,
  className,
}: DatePickerProps) {
  const { __ } = useTranslation();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-[180px] justify-start text-left font-normal", 
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: fr }) : <span>{__("common.pick_date")}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => newDate && onSelect(newDate)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
} 