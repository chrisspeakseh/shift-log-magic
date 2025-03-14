import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

export type TimeEntryFormData = {
  date: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  hourlyRate: number;
  currency: string;
};

export function useTimeEntryForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [formData, setFormData] = useState<TimeEntryFormData>({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    breakTime: 0,
    hourlyRate: 0,
    currency: 'USD'
  });

  // Use useCallback for fetch function to prevent recreation on each render
  const fetchUserPreferences = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoadingPreferences(true);
      
      // Get the most recent entry first
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
          hourlyRate: recentEntry.hourly_rate || 0,
          currency: recentEntry.currency || 'USD',
          breakTime: recentEntry.break_time || 0
        }));
      } 
      else {
        // Since the user_preferences table no longer has hourly_rate and currency fields,
        // we'll just use the default values from the initial state
        console.log("No recent entries found, using default values");
      }
    } catch (error: any) {
      console.error("Error fetching preferences:", error.message);
    } finally {
      setLoadingPreferences(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserPreferences();
  }, [fetchUserPreferences]);

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

      toast({
        title: "Success",
        description: "Time entry added successfully",
      });

      // Reset only date and times, keep the rate and currency
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

  // Use memoized handler functions to prevent recreation on each render
  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, date: e.target.value }));
  }, []);

  const handleStartTimeChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, startTime: value }));
  }, []);

  const handleEndTimeChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, endTime: value }));
  }, []);

  const handleBreakTimeChange = useCallback((values: number[]) => {
    setFormData(prev => ({ ...prev, breakTime: values[0] }));
  }, []);

  const handleHourlyRateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }));
  }, []);

  const handleCurrencyChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, currency: value }));
  }, []);

  return {
    loading,
    loadingPreferences,
    formData,
    handleSubmit,
    handleDateChange,
    handleStartTimeChange,
    handleEndTimeChange,
    handleBreakTimeChange,
    handleHourlyRateChange,
    handleCurrencyChange
  };
}
