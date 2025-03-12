
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { Clock, Settings, FileText, LogOut } from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Only show navbar when user is logged in
  if (!user) return null;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="hidden md:block">
            <h1 className="text-xl font-bold">TimeSheet</h1>
          </div>
          
          <nav className="flex items-center justify-center w-full md:w-auto space-x-1 md:space-x-2">
            <Link to="/timesheet">
              <Button 
                variant={isActive("/timesheet") ? "default" : "ghost"} 
                size="sm" 
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 h-auto py-2"
              >
                <Clock className="h-5 w-5" />
                <span className="text-xs md:text-sm">Timesheet</span>
              </Button>
            </Link>
            
            <Link to="/reports">
              <Button 
                variant={isActive("/reports") ? "default" : "ghost"} 
                size="sm" 
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 h-auto py-2"
              >
                <FileText className="h-5 w-5" />
                <span className="text-xs md:text-sm">Reports</span>
              </Button>
            </Link>
            
            <Link to="/settings">
              <Button 
                variant={isActive("/settings") ? "default" : "ghost"} 
                size="sm" 
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 h-auto py-2"
              >
                <Settings className="h-5 w-5" />
                <span className="text-xs md:text-sm">Settings</span>
              </Button>
            </Link>
          </nav>
          
          <div className="hidden md:block">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
