
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Clock, Trash2, Plus, Calendar } from "lucide-react";
import { format } from "date-fns";
import { CURRENCIES } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

type Template = {
  id: string;
  name: string;
  start_time: string | null;
  end_time: string | null;
  break_time: number;
  hourly_rate: number;
  currency: string;
  created_at: string;
};

export const TemplateList = () => {
  const { user } = useAuth();
  const [applyDate, setApplyDate] = useState(new Date().toISOString().split('T')[0]);
  const queryClient = useQueryClient();
  
  // Move data fetching to React Query
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('entry_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching templates:", error.message);
        toast({
          title: "Error",
          description: "Failed to load templates",
          variant: "destructive",
        });
        return [];
      }
      
      return data || [];
    },
    enabled: !!user, // Only run query when user is available
    staleTime: 30000, // Reduce refetching frequency (30 seconds)
  });

  // Mutations for better UX
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('entry_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['templates', user?.id], (old: Template[] = []) => 
        old.filter(template => template.id !== id)
      );
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const applyMutation = useMutation({
    mutationFn: async ({ template, date }: { template: Template, date: string }) => {
      if (!user || !date) throw new Error("User or date missing");
      
      const { error } = await supabase
        .from('time_entries')
        .insert({
          user_id: user.id,
          date: date,
          start_time: template.start_time,
          end_time: template.end_time,
          break_time: template.break_time,
          hourly_rate: template.hourly_rate,
          currency: template.currency
        });

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate time entries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      
      toast({
        title: "Success",
        description: "Time entry created from template",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteTemplate = (id: string) => {
    deleteMutation.mutate(id);
  };

  const applyTemplate = (template: Template, date: string) => {
    applyMutation.mutate({ template, date });
  };

  const formatTime = (time: string | null) => {
    if (!time) return "Not set";
    return format(new Date(`2000-01-01T${time}`), 'hh:mm a');
  };

  const getCurrencySymbol = (code: string) => {
    const currency = CURRENCIES.find(c => c.code === code);
    return currency ? currency.symbol : code;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground mb-4">No templates found. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <Card key={template.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold">{template.name}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1 opacity-70" />
                    {formatTime(template.start_time)} - {formatTime(template.end_time)}
                  </div>
                  {template.break_time > 0 && (
                    <div>
                      {template.break_time} min break
                    </div>
                  )}
                  <div>
                    {getCurrencySymbol(template.currency)} {template.hourly_rate}/hr
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      <span>Apply</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply Template: {template.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="date" className="text-sm font-medium">Select Date</label>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 opacity-70" />
                          <Input
                            id="date"
                            type="date"
                            value={applyDate}
                            onChange={(e) => setApplyDate(e.target.value)}
                            required
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button onClick={() => applyTemplate(template, applyDate)}>
                            Create Entry
                          </Button>
                        </DialogClose>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteTemplate(template.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
