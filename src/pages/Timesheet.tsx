
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { TimeEntryForm } from "@/components/timesheet/TimeEntryForm";
import { TimeEntryList } from "@/components/timesheet/TimeEntryList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, PlusCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Timesheet = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-20 md:mb-0 md:py-12 mt-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold">Your Timesheet</h1>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={signOut}
          className="md:hidden flex items-center gap-2 mt-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
      
      <Tabs defaultValue="entries" className="space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex gap-0 rounded-lg">
          <TabsTrigger value="entries" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span>Time Entries</span>
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>New Entry</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="entries" className="focus-visible:outline-none focus-visible:ring-0">
          <TimeEntryList />
        </TabsContent>
        
        <TabsContent value="new" className="focus-visible:outline-none focus-visible:ring-0">
          <TimeEntryForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Timesheet;
