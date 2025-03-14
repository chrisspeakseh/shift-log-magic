
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTimeEntryForm } from "@/hooks/use-time-entry-form";
import DateTimeSection from "./DateTimeSection";
import BreakTimeSection from "./BreakTimeSection";
import RateSection from "./RateSection";

export const TimeEntryForm = () => {
  const {
    loading,
    formData,
    handleSubmit,
    handleDateChange,
    handleStartTimeChange,
    handleEndTimeChange,
    handleBreakTimeChange,
    handleHourlyRateChange,
    handleCurrencyChange
  } = useTimeEntryForm();

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <DateTimeSection 
          date={formData.date}
          startTime={formData.startTime}
          endTime={formData.endTime}
          onDateChange={handleDateChange}
          onStartTimeChange={handleStartTimeChange}
          onEndTimeChange={handleEndTimeChange}
        />
        
        <BreakTimeSection 
          breakTime={formData.breakTime}
          onBreakTimeChange={handleBreakTimeChange}
        />
        
        <RateSection 
          hourlyRate={formData.hourlyRate}
          currency={formData.currency}
          onHourlyRateChange={handleHourlyRateChange}
          onCurrencyChange={handleCurrencyChange}
        />
        
        <Button type="submit" disabled={loading} className="w-full md:w-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : "Add Time Entry"}
        </Button>
      </form>
    </Card>
  );
};
