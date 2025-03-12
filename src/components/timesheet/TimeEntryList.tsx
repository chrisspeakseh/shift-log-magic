
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TimeEntry } from "@/lib/types";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const TimeEntryList = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTimeEntries();
    }
  }, [user]);

  const fetchTimeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      // Transform the data to match our TimeEntry type
      const transformedData: TimeEntry[] = data.map(entry => ({
        id: entry.id,
        userId: entry.user_id,
        date: entry.date,
        startTime: entry.start_time,
        endTime: entry.end_time || '',
        hourlyRate: entry.hourly_rate,
        currency: entry.currency,
        breakTime: entry.break_time || 0
      }));

      setEntries(transformedData);
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

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time entry deleted",
      });

      // Remove the deleted entry from the state
      setEntries(entries.filter(entry => entry.id !== id));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-6">Loading time entries...</div>;
  }

  return (
    <div className="space-y-4">
      {entries.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p>No time entries found.</p>
            <p>Add your first entry using the "New Entry" tab.</p>
          </CardContent>
        </Card>
      ) : (
        entries.map((entry) => (
          <Card key={entry.id} className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">{format(new Date(entry.date), 'PPP')}</div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteEntry(entry.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Time</div>
                  <div>{entry.startTime} - {entry.endTime || 'ongoing'}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Break</div>
                  <div>{entry.breakTime} minutes</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Rate</div>
                  <div>{entry.currency} {entry.hourlyRate}/hr</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Total</div>
                  <div>{calculateTotal(entry)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

// Helper function to calculate total amount
const calculateTotal = (entry: TimeEntry) => {
  if (!entry.endTime) return 'In progress';
  
  const startParts = entry.startTime.split(':');
  const endParts = entry.endTime.split(':');
  
  const startDate = new Date();
  startDate.setHours(parseInt(startParts[0], 10), parseInt(startParts[1], 10), 0);
  
  const endDate = new Date();
  endDate.setHours(parseInt(endParts[0], 10), parseInt(endParts[1], 10), 0);
  
  // Calculate hours accounting for break time
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60) - (entry.breakTime / 60);
  
  if (diffHours <= 0) return '0.00';
  
  // Calculate total
  const total = diffHours * entry.hourlyRate;
  return total.toFixed(2);
};
