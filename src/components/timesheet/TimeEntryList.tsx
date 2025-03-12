
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TimeEntry, Currency, CURRENCIES, TimesheetReport } from "@/lib/types";
import { format, parseISO, addHours, differenceInMinutes } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Clock, Trash2, Edit2, Copy, ChevronsUpDown, Save, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const TimeEntryList = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [editFormData, setEditFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    breakTime: 0,
    hourlyRate: 0,
    currency: "USD",
  });
  const [groupedEntries, setGroupedEntries] = useState<Record<string, TimeEntry[]>>({});
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportDateRange, setReportDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
  });
  const [reportData, setReportData] = useState<TimesheetReport | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTimeEntries();
    }
  }, [user]);

  useEffect(() => {
    if (entries.length > 0) {
      // Group entries by month
      const grouped = entries.reduce((acc, entry) => {
        const monthYear = format(new Date(entry.date), 'MMMM yyyy');
        if (!acc[monthYear]) {
          acc[monthYear] = [];
        }
        acc[monthYear].push(entry);
        return acc;
      }, {} as Record<string, TimeEntry[]>);
      
      // Sort entries within each month by date (newest first)
      Object.keys(grouped).forEach(key => {
        grouped[key].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });
      
      setGroupedEntries(grouped);
    }
  }, [entries]);

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

  const startEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setEditFormData({
      date: entry.date,
      startTime: entry.startTime,
      endTime: entry.endTime || '',
      breakTime: entry.breakTime,
      hourlyRate: entry.hourlyRate,
      currency: entry.currency,
    });
  };

  const cancelEdit = () => {
    setEditingEntry(null);
  };

  const saveEdit = async () => {
    if (!editingEntry) return;
    
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('time_entries')
        .update({
          date: editFormData.date,
          start_time: editFormData.startTime,
          end_time: editFormData.endTime || null,
          break_time: editFormData.breakTime,
          hourly_rate: editFormData.hourlyRate,
          currency: editFormData.currency
        })
        .eq('id', editingEntry.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time entry updated",
      });

      // Update the entry in the local state
      setEntries(entries.map(entry => 
        entry.id === editingEntry.id 
          ? { 
              ...entry, 
              date: editFormData.date,
              startTime: editFormData.startTime,
              endTime: editFormData.endTime,
              breakTime: editFormData.breakTime,
              hourlyRate: editFormData.hourlyRate,
              currency: editFormData.currency
            } 
          : entry
      ));
      
      setEditingEntry(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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

  const generateReport = () => {
    const filteredEntries = entries.filter(entry => {
      const entryDate = entry.date;
      return entryDate >= reportDateRange.from && entryDate <= reportDateRange.to && entry.endTime;
    });
    
    if (filteredEntries.length === 0) {
      toast({
        title: "No entries",
        description: "No completed entries found for the selected date range",
        variant: "destructive",
      });
      return;
    }
    
    // Determine the most common currency
    const currencyCounts: Record<string, number> = {};
    filteredEntries.forEach(entry => {
      if (!currencyCounts[entry.currency]) {
        currencyCounts[entry.currency] = 0;
      }
      currencyCounts[entry.currency]++;
    });
    
    let mostCommonCurrency = "USD";
    let maxCount = 0;
    
    Object.entries(currencyCounts).forEach(([currency, count]) => {
      if (count > maxCount) {
        mostCommonCurrency = currency;
        maxCount = count;
      }
    });
    
    // Calculate total earnings in the most common currency
    // This is simplified and assumes all entries have the same currency
    let totalPay = 0;
    
    filteredEntries.forEach(entry => {
      if (entry.endTime) {
        const startParts = entry.startTime.split(':');
        const endParts = entry.endTime.split(':');
        
        const startDate = new Date();
        startDate.setHours(parseInt(startParts[0], 10), parseInt(startParts[1], 10), 0);
        
        const endDate = new Date();
        endDate.setHours(parseInt(endParts[0], 10), parseInt(endParts[1], 10), 0);
        
        // Calculate hours accounting for break time
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60) - (entry.breakTime / 60);
        
        if (diffHours > 0) {
          totalPay += diffHours * entry.hourlyRate;
        }
      }
    });
    
    // Sort entries by date
    const sortedEntries = [...filteredEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    setReportData({
      startDate: reportDateRange.from,
      endDate: reportDateRange.to,
      entries: sortedEntries,
      totalPay,
      currency: mostCommonCurrency
    });
    
    setReportModalOpen(true);
  };

  const copyReport = () => {
    if (!reportData) return;
    
    const currencySymbol = CURRENCIES.find(c => c.code === reportData.currency)?.symbol || reportData.currency;
    
    let reportText = `Time Period: From ${format(new Date(reportData.startDate), 'PPP')} to ${format(new Date(reportData.endDate), 'PPP')}\n\n`;
    
    reportData.entries.forEach(entry => {
      const startTimeFormatted = format(parseISO(`2000-01-01T${entry.startTime}`), 'h:mm a');
      
      let endTimeFormatted = 'ongoing';
      let dailyPay = '(in progress)';
      
      if (entry.endTime) {
        endTimeFormatted = format(parseISO(`2000-01-01T${entry.endTime}`), 'h:mm a');
        
        const startParts = entry.startTime.split(':');
        const endParts = entry.endTime.split(':');
        
        const startDate = new Date();
        startDate.setHours(parseInt(startParts[0], 10), parseInt(startParts[1], 10), 0);
        
        const endDate = new Date();
        endDate.setHours(parseInt(endParts[0], 10), parseInt(endParts[1], 10), 0);
        
        // Calculate hours accounting for break time
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60) - (entry.breakTime / 60);
        
        if (diffHours > 0) {
          const total = diffHours * entry.hourlyRate;
          dailyPay = `${currencySymbol}${total.toFixed(2)}`;
        } else {
          dailyPay = `${currencySymbol}0.00`;
        }
      }
      
      reportText += `${format(new Date(entry.date), 'PPP')} - Work from ${startTimeFormatted} to ${endTimeFormatted} - ${dailyPay}\n`;
    });
    
    reportText += `\nTotal Pay: ${currencySymbol}${reportData.totalPay.toFixed(2)}`;
    
    navigator.clipboard.writeText(reportText).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "The report has been copied to your clipboard"
      });
    }).catch(err => {
      toast({
        title: "Error",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    });
  };

  const getCurrencySymbol = (code: string): string => {
    const currency = CURRENCIES.find(c => c.code === code);
    return currency ? currency.symbol : code;
  };

  if (loading) {
    return <div className="flex justify-center p-6">Loading time entries...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Time Entries</h2>
        <Button onClick={generateReport} className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Generate Report</span>
        </Button>
      </div>

      {/* Report Dialog */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Timesheet Report</DialogTitle>
            <DialogDescription>
              Time period: {reportData && format(new Date(reportData.startDate), 'PPP')} to {reportData && format(new Date(reportData.endDate), 'PPP')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {reportData && reportData.entries.map((entry) => {
              const startTimeFormatted = format(parseISO(`2000-01-01T${entry.startTime}`), 'h:mm a');
              let endTimeFormatted = 'ongoing';
              let dailyPay = '(in progress)';
              
              if (entry.endTime) {
                endTimeFormatted = format(parseISO(`2000-01-01T${entry.endTime}`), 'h:mm a');
                
                const startParts = entry.startTime.split(':');
                const endParts = entry.endTime.split(':');
                
                const startDate = new Date();
                startDate.setHours(parseInt(startParts[0], 10), parseInt(startParts[1], 10), 0);
                
                const endDate = new Date();
                endDate.setHours(parseInt(endParts[0], 10), parseInt(endParts[1], 10), 0);
                
                // Calculate hours accounting for break time
                const diffMs = endDate.getTime() - startDate.getTime();
                const diffHours = diffMs / (1000 * 60 * 60) - (entry.breakTime / 60);
                
                if (diffHours > 0) {
                  const total = diffHours * entry.hourlyRate;
                  dailyPay = `${getCurrencySymbol(entry.currency)}${total.toFixed(2)}`;
                } else {
                  dailyPay = `${getCurrencySymbol(entry.currency)}0.00`;
                }
              }
              
              return (
                <div key={entry.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{format(new Date(entry.date), 'PPP')}</p>
                    <p className="text-sm text-muted-foreground">
                      {startTimeFormatted} to {endTimeFormatted}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>{dailyPay}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center border-t pt-4">
            <p className="font-semibold">Total Pay:</p>
            <p className="font-bold">
              {reportData && getCurrencySymbol(reportData.currency)}
              {reportData && reportData.totalPay.toFixed(2)}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" className="w-full" onClick={copyReport}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Date Range Picker for Report */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="fromDate" className="text-sm font-medium">From Date</label>
              <Input
                id="fromDate"
                type="date"
                value={reportDateRange.from}
                onChange={(e) => setReportDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="toDate" className="text-sm font-medium">To Date</label>
              <Input
                id="toDate"
                type="date"
                value={reportDateRange.to}
                onChange={(e) => setReportDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p>No time entries found.</p>
            <p>Add your first entry using the "New Entry" tab.</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="w-full" defaultValue={Object.keys(groupedEntries)}>
          {Object.entries(groupedEntries).map(([month, monthEntries]) => (
            <AccordionItem key={month} value={month} className="border rounded-lg mb-4">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex justify-between items-center w-full">
                  <span className="text-lg font-medium">{month}</span>
                  <span className="text-sm text-muted-foreground">
                    {monthEntries.length} {monthEntries.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0">
                <div className="space-y-3 px-4 pb-2">
                  {monthEntries.map((entry) => (
                    <Card key={entry.id} className="hover:bg-muted/50 transition-colors">
                      {editingEntry && editingEntry.id === entry.id ? (
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label htmlFor="edit-date" className="text-sm font-medium">Date</label>
                            <Input
                              id="edit-date"
                              type="date"
                              value={editFormData.date}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, date: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="edit-startTime" className="text-sm font-medium">Start Time</label>
                            <Input
                              id="edit-startTime"
                              type="time"
                              value={editFormData.startTime}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, startTime: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="edit-endTime" className="text-sm font-medium">End Time</label>
                            <Input
                              id="edit-endTime"
                              type="time"
                              value={editFormData.endTime}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, endTime: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="edit-breakTime" className="text-sm font-medium">Break: {editFormData.breakTime} minutes</label>
                            <Slider
                              id="edit-breakTime"
                              min={0}
                              max={120}
                              step={5}
                              value={[editFormData.breakTime]}
                              onValueChange={(values) => setEditFormData(prev => ({ ...prev, breakTime: values[0] }))}
                              className="py-2"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="edit-hourlyRate" className="text-sm font-medium">Hourly Rate</label>
                            <Input
                              id="edit-hourlyRate"
                              type="number"
                              min="0"
                              step="0.01"
                              value={editFormData.hourlyRate}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="edit-currency" className="text-sm font-medium">Currency</label>
                            <Select 
                              value={editFormData.currency} 
                              onValueChange={(value) => setEditFormData(prev => ({ ...prev, currency: value }))}
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
                          <div className="col-span-full flex justify-end space-x-2 mt-3">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={cancelEdit}
                            >
                              <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                            <Button 
                              type="button" 
                              size="sm" 
                              onClick={saveEdit}
                              disabled={saving}
                            >
                              {saving ? (
                                <>
                                  <span className="animate-spin mr-1">⌛</span> Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-1" /> Save
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      ) : (
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium">{format(new Date(entry.date), 'PPP')}</div>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={() => startEditEntry(entry)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteEntry(entry.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">Time</div>
                              <div>
                                {format(parseISO(`2000-01-01T${entry.startTime}`), 'h:mm a')} - 
                                {entry.endTime ? format(parseISO(`2000-01-01T${entry.endTime}`), ' h:mm a') : ' ongoing'}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">Break</div>
                              <div>{entry.breakTime} minutes</div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">Rate</div>
                              <div>{getCurrencySymbol(entry.currency)} {entry.hourlyRate}/hr</div>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">Total</div>
                              <div>{calculateTotal(entry, getCurrencySymbol(entry.currency))}</div>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

// Helper function to calculate total amount
const calculateTotal = (entry: TimeEntry, currencySymbol: string): string => {
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
  
  if (diffHours <= 0) return `${currencySymbol}0.00`;
  
  // Calculate total
  const total = diffHours * entry.hourlyRate;
  return `${currencySymbol}${total.toFixed(2)}`;
};
