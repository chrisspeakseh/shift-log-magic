
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Clock } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  // Redirect to timesheet if already logged in
  if (user) {
    return <Navigate to="/timesheet" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 bg-primary/10 p-4 rounded-full inline-block">
            <Clock className="h-12 w-12 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Track Your Time, Maximize Your Earnings
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            A simple, effective timesheet app for tracking your work hours and calculating your earnings.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            
            <Link to="/auth?tab=signin">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="bg-muted/50 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Why Choose Our Timesheet App?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Easy Time Tracking</h3>
              <p className="text-muted-foreground">
                Log your work hours with a simple, intuitive interface. Track start time, end time, and breaks.
              </p>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Earnings Overview</h3>
              <p className="text-muted-foreground">
                See your earnings by week, month, or custom date ranges. Know exactly how much you've earned.
              </p>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Secure & Accessible</h3>
              <p className="text-muted-foreground">
                Your data is securely stored and accessible from any device. Never lose your timesheet data again.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-background py-6 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} TimeSheet App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
