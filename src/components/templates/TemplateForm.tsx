
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { CURRENCIES } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Loader2, Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const TemplateForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    breakTime: 0,
    hourlyRate: 0,
    currency: "USD"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('entry_templates')
        .insert({
          user_id: user.id,
          name: formData.name,
          start_time: formData.startTime || null,
          end_time: formData.endTime || null,
          break_time: formData.breakTime,
          hourly_rate: formData.hourlyRate,
          currency: formData.currency
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template created successfully",
      });

      // Reset form
      setFormData({
        name: "",
        startTime: "",
        endTime: "",
        breakTime: 0,
        hourlyRate: 0,
        currency: "USD"
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

  const TimeInput = ({ label, value, onChange, id, required = true }: { 
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
  );

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Template Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Template Name</label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Daily Work Hours"
            required
          />
        </div>

        {/* Start Time and End Time on the same line */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="startTime" className="text-sm font-medium">Start Time</label>
            <TimeInput
              id="startTime"
              label="Select start time"
              value={formData.startTime}
              onChange={(value) => setFormData(prev => ({ ...prev, startTime: value }))}
              required={false}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="endTime" className="text-sm font-medium">End Time</label>
            <TimeInput
              id="endTime"
              label="Select end time"
              value={formData.endTime}
              onChange={(value) => setFormData(prev => ({ ...prev, endTime: value }))}
              required={false}
            />
          </div>
        </div>

        {/* Break Time slider below time inputs */}
        <div className="space-y-2">
          <label htmlFor="breakTime" className="text-sm font-medium">Break: {formData.breakTime} minutes</label>
          <Slider
            id="breakTime"
            min={0}
            max={120}
            step={5}
            value={[formData.breakTime]}
            onValueChange={(values) => setFormData(prev => ({ ...prev, breakTime: values[0] }))}
            className="py-2"
          />
        </div>

        {/* Hourly Rate and Currency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="hourlyRate" className="text-sm font-medium">Hourly Rate</label>
            <Input
              id="hourlyRate"
              type="number"
              min="0"
              step="0.01"
              value={formData.hourlyRate.toString()}
              onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="currency" className="text-sm font-medium">Currency</label>
            <Select 
              value={formData.currency} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
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
        
        <Button type="submit" disabled={loading} className="w-full md:w-auto">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : "Create Template"}
        </Button>
      </form>
    </Card>
  );
};
