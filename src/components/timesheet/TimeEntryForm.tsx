
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TimeEntry } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";

export const TimeEntryForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    breakTime: 0,
    hourlyRate: 0,
    currency: 'USD'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('time_entries')
        .insert([{
          ...formData,
          break_time: formData.breakTime,
          hourly_rate: formData.hourlyRate,
          start_time: formData.startTime,
          end_time: formData.endTime
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time entry added successfully",
      });

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        breakTime: 0,
        hourlyRate: 0,
        currency: 'USD'
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">Date</label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="startTime" className="text-sm font-medium">Start Time</label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="endTime" className="text-sm font-medium">End Time</label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="breakTime" className="text-sm font-medium">Break (minutes)</label>
            <Input
              id="breakTime"
              type="number"
              min="0"
              value={formData.breakTime}
              onChange={(e) => setFormData(prev => ({ ...prev, breakTime: parseInt(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="hourlyRate" className="text-sm font-medium">Hourly Rate</label>
            <Input
              id="hourlyRate"
              type="number"
              min="0"
              step="0.01"
              value={formData.hourlyRate}
              onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="currency" className="text-sm font-medium">Currency</label>
            <Input
              id="currency"
              value={formData.currency}
              onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              required
            />
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Time Entry"}
        </Button>
      </form>
    </Card>
  );
};
