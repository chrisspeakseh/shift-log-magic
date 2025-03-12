import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { CURRENCIES } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";

export const TimeEntryForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    breakTime: 0,
    hourlyRate: 0,
    currency: 'USD'
  });
  const [loadingPreferences, setLoadingPreferences] = useState(true);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;
      
      try {
        setLoadingPreferences(true);
        
        const { data: preferences, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (preferencesError) throw preferencesError;
        
        if (preferences) {
          const { data: recentEntries, error: entriesError } = await supabase
            .from('time_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (entriesError) throw entriesError;
          
          if (recentEntries && recentEntries.length > 0) {
            const recentEntry = recentEntries[0];
            setFormData(prev => ({
              ...prev,
              hourlyRate: recentEntry.hourly_rate,
              currency: recentEntry.currency,
              breakTime: recentEntry.break_time || 0
            }));
          } 
          else if (preferences) {
            setFormData(prev => ({
              ...prev,
              hourlyRate: preferences.default_hourly_rate || 0,
              currency: preferences.default_currency || 'USD'
            }));
          }
        }
      } catch (error: any) {
        console.error("Error fetching preferences:", error.message);
      } finally {
        setLoadingPreferences(false);
      }
    };

    fetchUserPreferences();
  }, [user]);

  const updateUserPreferences = async (hourlyRate: number, currency: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({
          default_hourly_rate: hourlyRate,
          default_currency: currency
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error("Error updating preferences:", error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('time_entries')
        .insert({
          user_id: user.id,
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime || null,
          break_time: formData.breakTime,
          hourly_rate: formData.hourlyRate,
          currency: formData.currency
        });

      if (error) throw error;

      await updateUserPreferences(formData.hourlyRate, formData.currency);

      toast({
        title: "Success",
        description: "Time entry added successfully",
      });

      setFormData(prev => ({
        ...prev,
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: ''
      }));
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
            <label htmlFor="endTime" className="text-sm font-medium">End Time (leave empty for ongoing)</label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
            />
          </div>
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
          <div className="space-y-2">
            <label htmlFor="hourlyRate" className="text-sm font-medium">Hourly Rate</label>
            <Input
              id="hourlyRate"
              type="number"
              min="0"
              step="0.01"
              value={formData.hourlyRate}
              onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
              required
              disabled={loadingPreferences}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="currency" className="text-sm font-medium">Currency</label>
            <Select 
              value={formData.currency} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              disabled={loadingPreferences}
            >
              <SelectTrigger>
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
        <Button type="submit" disabled={loading || loadingPreferences} className="w-full md:w-auto">
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
