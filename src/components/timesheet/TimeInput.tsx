
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Memoize TimeInput to prevent unnecessary re-renders
const TimeInput = memo(({ label, value, onChange, id, required = true }: { 
  label: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
  required?: boolean;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !value && "text-muted-foreground"
        )}
      >
        <Clock className="mr-2 h-4 w-4" />
        {value ? format(new Date(`2000-01-01T${value}`), 'hh:mm a') : label}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <div className="grid gap-2 p-4">
        <Input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-[160px]"
        />
      </div>
    </PopoverContent>
  </Popover>
));

TimeInput.displayName = "TimeInput";

export default TimeInput;
