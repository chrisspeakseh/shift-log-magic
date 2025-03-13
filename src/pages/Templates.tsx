
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, PlusCircle } from "lucide-react";
import { TemplateList } from "@/components/templates/TemplateList";
import { TemplateForm } from "@/components/templates/TemplateForm";
import { Loader2 } from "lucide-react";

const Templates = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Just to ensure authentication is checked
    setLoading(false);
  }, []);

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-20 md:mb-0 md:py-12 mt-16">
      <h1 className="text-2xl font-bold mb-6">Entry Templates</h1>
      
      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex gap-0 rounded-lg">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span>My Templates</span>
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>New Template</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="focus-visible:outline-none focus-visible:ring-0">
          <TemplateList />
        </TabsContent>
        
        <TabsContent value="new" className="focus-visible:outline-none focus-visible:ring-0">
          <TemplateForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Templates;
