
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const Reports = () => {
  const { user } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-20 md:mb-0 md:py-12">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      
      <div className="bg-muted/30 p-8 rounded-lg text-center">
        <p className="text-muted-foreground">
          Reports functionality will be implemented soon.
        </p>
      </div>
    </div>
  );
};

export default Reports;
