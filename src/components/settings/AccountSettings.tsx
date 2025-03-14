
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const AccountSettings = () => {
  const { signOut } = useAuth();

  return (
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
  );
};

export default AccountSettings;
