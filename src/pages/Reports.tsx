import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeStatistics, TimeEntry, CURRENCIES } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { CalendarDateRangePicker } from "@/components/reports/DateRangePicker";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Clock, DollarSign, Calculator, BarChart2 } from "lucide-react";

const Reports = () => {
  const { user } = useAuth();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [statistics, setStatistics] = useState<TimeStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date()),
  });
  const [period, setPeriod] = useState<string>("week");

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" />;
  }

  useEffect(() => {
    if (user) {
      updateDateRange(period);
    }
  }, [user, period]);

  useEffect(() => {
    if (user && dateRange.from && dateRange.to) {
      fetchTimeEntries();
    }
  }, [user, dateRange]);

  const updateDateRange = (selectedPeriod: string) => {
    const now = new Date();
    let newRange = { from: startOfWeek(now), to: endOfWeek(now) };

    switch (selectedPeriod) {
      case "week":
        newRange = { from: startOfWeek(now), to: endOfWeek(now) };
        break;
      case "month":
        newRange = { from: startOfMonth(now), to: endOfMonth(now) };
        break;
      case "year":
        newRange = { from: startOfYear(now), to: endOfYear(now) };
        break;
      case "last7":
        newRange = { from: subDays(now, 7), to: now };
        break;
      case "last30":
        newRange = { from: subDays(now, 30), to: now };
        break;
      case "custom":
        // Keep the current custom range
        return;
      default:
        break;
    }
    
    setDateRange(newRange);
  };

  const fetchTimeEntries = async () => {
    setLoading(true);
    try {
      const fromDate = format(dateRange.from, 'yyyy-MM-dd');
      const toDate = format(dateRange.to, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .gte('date', fromDate)
        .lte('date', toDate)
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

      setTimeEntries(transformedData);
      calculateStatistics(transformedData);
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

  const calculateStatistics = (entries: TimeEntry[]) => {
    if (entries.length === 0) {
      setStatistics(null);
      return;
    }

    let totalHours = 0;
    let totalEarnings = 0;
    const mainCurrency = entries[0].currency; // Assume the first entry's currency for simplicity

    entries.forEach(entry => {
      if (!entry.endTime) return; // Skip ongoing entries

      const startParts = entry.startTime.split(':');
      const endParts = entry.endTime.split(':');
      
      const startDate = new Date();
      startDate.setHours(parseInt(startParts[0], 10), parseInt(startParts[1], 10), 0);
      
      const endDate = new Date();
      endDate.setHours(parseInt(endParts[0], 10), parseInt(endParts[1], 10), 0);
      
      // Calculate hours accounting for break time
      const diffMs = endDate.getTime() - startDate.getTime();
      const hours = diffMs / (1000 * 60 * 60) - (entry.breakTime / 60);
      
      if (hours > 0) {
        totalHours += hours;
        totalEarnings += hours * entry.hourlyRate;
      }
    });

    const stats: TimeStatistics = {
      totalHours: parseFloat(totalHours.toFixed(2)),
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      averageHourlyRate: entries.length > 0 ? parseFloat((totalEarnings / totalHours).toFixed(2)) : 0,
      currency: mainCurrency,
      entriesCount: entries.length,
      periodStart: format(dateRange.from, 'PPP'),
      periodEnd: format(dateRange.to, 'PPP')
    };

    setStatistics(stats);
  };

  // Prepare data for charts
  const prepareChartData = () => {
    if (!timeEntries.length) return [];

    const dailyData: Record<string, { date: string, hours: number, earnings: number }> = {};

    timeEntries.forEach(entry => {
      if (!entry.endTime) return; // Skip ongoing entries

      const date = entry.date;
      if (!dailyData[date]) {
        dailyData[date] = { date, hours: 0, earnings: 0 };
      }

      const startParts = entry.startTime.split(':');
      const endParts = entry.endTime.split(':');
      
      const startDate = new Date();
      startDate.setHours(parseInt(startParts[0], 10), parseInt(startParts[1], 10), 0);
      
      const endDate = new Date();
      endDate.setHours(parseInt(endParts[0], 10), parseInt(endParts[1], 10), 0);
      
      // Calculate hours accounting for break time
      const diffMs = endDate.getTime() - startDate.getTime();
      const hours = diffMs / (1000 * 60 * 60) - (entry.breakTime / 60);
      
      if (hours > 0) {
        dailyData[date].hours += hours;
        dailyData[date].earnings += hours * entry.hourlyRate;
      }
    });

    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
  };

  const chartData = prepareChartData();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="container mx-auto px-4 py-8 mb-20 md:mb-0 md:py-12">
      <h1 className="text-2xl font-bold mb-6">Reports & Statistics</h1>
      
      <div className="mb-6 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Date Range</CardTitle>
            <CardDescription>Select time period for reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="last7">Last 7 Days</SelectItem>
                    <SelectItem value="last30">Last 30 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {period === "custom" && (
                <div className="flex items-center">
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <div>From: {format(dateRange.from, 'PPP')}</div>
                      <div className="mx-2">-</div>
                      <div>To: {format(dateRange.to, 'PPP')}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Loading statistics...</div>
      ) : !statistics ? (
        <div className="bg-muted/30 p-8 rounded-lg text-center">
          <p className="text-muted-foreground">
            No time entries found for the selected period.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Hours</CardDescription>
                <CardTitle className="text-2xl flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  {statistics.totalHours.toFixed(1)}
                </CardTitle>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Earnings</CardDescription>
                <CardTitle className="text-2xl flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  {statistics.currency} {statistics.totalEarnings.toFixed(2)}
                </CardTitle>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Average Rate</CardDescription>
                <CardTitle className="text-2xl flex items-center">
                  <Calculator className="mr-2 h-5 w-5" />
                  {statistics.currency} {statistics.averageHourlyRate.toFixed(2)}/hr
                </CardTitle>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Entries</CardDescription>
                <CardTitle className="text-2xl flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5" />
                  {statistics.entriesCount}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
          
          {chartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Hours</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(new Date(date), 'dd MMM')}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(1)} hours`, 'Hours']}
                        labelFormatter={(date) => format(new Date(date), 'PPP')}
                      />
                      <Bar dataKey="hours" fill="#8884d8" name="Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Daily Earnings</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(new Date(date), 'dd MMM')}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [`${statistics.currency} ${value.toFixed(2)}`, 'Earnings']}
                        labelFormatter={(date) => format(new Date(date), 'PPP')}
                      />
                      <Bar dataKey="earnings" fill="#82ca9d" name="Earnings" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
