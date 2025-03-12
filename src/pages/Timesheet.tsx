
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { TimeEntryForm } from "@/components/timesheet/TimeEntryForm";
import { TimeEntryList } from "@/components/timesheet/TimeEntryList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Timesheet = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-20 md:mb-0 md:py-12">
      <h1 className="text-2xl font-bold mb-6">Your Timesheet</h1>
      
      <Tabs defaultValue="entries" className="space-y-6">
        <TabsList>
          <TabsTrigger value="entries">Time Entries</TabsTrigger>
          <TabsTrigger value="new">New Entry</TabsTrigger>
        </TabsList>
        
        <TabsContent value="entries">
          <TimeEntryList />
        </TabsContent>
        
        <TabsContent value="new">
          <TimeEntryForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Timesheet;
