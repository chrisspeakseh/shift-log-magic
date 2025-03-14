
import { Slider } from "@/components/ui/slider";

type BreakTimeSectionProps = {
  breakTime: number;
  onBreakTimeChange: (values: number[]) => void;
};

const BreakTimeSection = ({ breakTime, onBreakTimeChange }: BreakTimeSectionProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor="breakTime" className="text-sm font-medium">Break: {breakTime} minutes</label>
      <Slider
        id="breakTime"
        min={0}
        max={120}
        step={5}
        value={[breakTime]}
        onValueChange={onBreakTimeChange}
        className="py-2"
      />
    </div>
  );
};

export default BreakTimeSection;
