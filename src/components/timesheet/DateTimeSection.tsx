
import { Input } from "@/components/ui/input";
import TimeInput from "./TimeInput";

type DateTimeSectionProps = {
  date: string;
  startTime: string;
  endTime: string;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
};

const DateTimeSection = ({
  date,
  startTime,
  endTime,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange
}: DateTimeSectionProps) => {
  return (
    <>
      {/* Date field centered at the top */}
      <div className="flex justify-center">
        <div className="w-full md:w-1/2 space-y-2">
          <label htmlFor="date" className="text-sm font-medium">Date</label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={onDateChange}
            required
          />
        </div>
      </div>

      {/* Start Time and End Time on the same line */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="startTime" className="text-sm font-medium">Start Time</label>
          <TimeInput
            id="startTime"
            label="Select start time"
            value={startTime}
            onChange={onStartTimeChange}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="endTime" className="text-sm font-medium">End Time (leave empty for ongoing)</label>
          <TimeInput
            id="endTime"
            label="Select end time"
            value={endTime}
            onChange={onEndTimeChange}
            required={false}
          />
        </div>
      </div>
    </>
  );
};

export default DateTimeSection;
