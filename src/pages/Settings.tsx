
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCIES } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Settings = () => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [defaultHourlyRate, setDefaultHourlyRate] = useState("0");
  const [loading, setLoading] = useState(false);

  // Password change
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [preferencesLoading, setPreferencesLoading] = useState(true);

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // Load user preferences
  useState(() => {
    const fetchPreferences = async () => {
      try {
        setPreferencesLoading(true);
        const { data, error } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setDefaultCurrency(data.default_currency);
          setDefaultHourlyRate(data.default_hourly_rate.toString());
        }
      } catch (error: any) {
        console.error("Error fetching preferences:", error.message);
      } finally {
        setPreferencesLoading(false);
      }
    };

    if (user) {
      fetchPreferences();
    }
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateProfile({ name });

      // Update preferences
      const { error } = await supabase
        .from("user_preferences")
        .update({
          default_currency: defaultCurrency,
          default_hourly_rate: parseFloat(defaultHourlyRate) || 0
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your profile has been updated",
      });
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      setPasswordLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your password has been updated",
      });
      
      // Clear password fields
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-20 md:mb-0 md:py-12">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="grid gap-6 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <label htmlFor="defaultCurrency" className="text-sm font-medium">Default Currency</label>
                <Select 
                  value={defaultCurrency} 
                  onValueChange={setDefaultCurrency}
                  disabled={preferencesLoading}
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
              
              <div className="space-y-2">
                <label htmlFor="defaultRate" className="text-sm font-medium">Default Hourly Rate</label>
                <Input
                  id="defaultRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={defaultHourlyRate}
                  onChange={(e) => setDefaultHourlyRate(e.target.value)}
                  placeholder="0.00"
                  disabled={preferencesLoading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password</CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordChange}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={passwordLoading || !newPassword || newPassword !== confirmPassword}>
                {passwordLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : "Update Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={signOut}
              className="w-full sm:w-auto"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
