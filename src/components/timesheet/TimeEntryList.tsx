
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TimeEntry } from "@/lib/types";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";

export const TimeEntryList = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeEntries();
  }, []);

  const fetchTimeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      setEntries(data || []);
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

  if (loading) {
    return <div>Loading time entries...</div>;
  }

  return (
    <div className="space-y-4">
      {entries.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No time entries found. Add your first entry above.
          </CardContent>
        </Card>
      ) : (
        entries.map((entry) => (
          <Card key={entry.id} className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm font-medium">Date</div>
                  <div>{format(new Date(entry.date), 'PP')}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Time</div>
                  <div>{entry.startTime} - {entry.endTime || 'ongoing'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Break</div>
                  <div>{entry.breakTime} minutes</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Rate</div>
                  <div>{entry.currency} {entry.hourlyRate}/hr</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
