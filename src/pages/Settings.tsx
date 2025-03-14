
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import ProfileSettings from "@/components/settings/ProfileSettings";
import ThemeSettings from "@/components/settings/ThemeSettings";
import PasswordSettings from "@/components/settings/PasswordSettings";
import AccountSettings from "@/components/settings/AccountSettings";

const Settings = () => {
  const { user } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-20 md:mb-0 md:py-12 mt-16">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="grid gap-6 max-w-lg">
        <ProfileSettings />
        <ThemeSettings />
        <PasswordSettings />
        <AccountSettings />
      </div>
    </div>
  );
};

export default Settings;
