
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCIES } from "@/lib/types";

type RateSectionProps = {
  hourlyRate: number;
  currency: string;
  onHourlyRateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCurrencyChange: (value: string) => void;
};

const RateSection = ({
  hourlyRate,
  currency,
  onHourlyRateChange,
  onCurrencyChange
}: RateSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label htmlFor="hourlyRate" className="text-sm font-medium">Hourly Rate</label>
        <Input
          id="hourlyRate"
          type="number"
          min="0"
          step="0.01"
          value={hourlyRate.toString()}
          onChange={onHourlyRateChange}
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="currency" className="text-sm font-medium">Currency</label>
        <Select 
          value={currency} 
          onValueChange={onCurrencyChange}
        >
          <SelectTrigger id="currency">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((curr) => (
              <SelectItem key={curr.code} value={curr.code}>
                {curr.symbol} {curr.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default RateSection;
