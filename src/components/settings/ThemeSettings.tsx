
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Sun, Loader2 } from "lucide-react";

const ThemeSettings = () => {
  const { theme, toggleTheme, saveThemePreference, isSaving } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize your app experience</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {theme === "dark" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <span>Dark Mode</span>
          </div>
          <Switch 
            checked={theme === "dark"}
            onCheckedChange={toggleTheme}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={saveThemePreference} 
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : "Save Theme"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ThemeSettings;
