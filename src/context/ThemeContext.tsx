
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/use-toast";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  saveThemePreference: () => Promise<void>;
  isSaving: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  // Load theme preference from localStorage first (for immediate display)
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    }
  }, []);

  // Load theme preference from database when user is authenticated
  useEffect(() => {
    const loadUserThemePreference = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("theme")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching theme preference:", error.message);
          return;
        }

        if (data && data.theme) {
          const userTheme = data.theme as Theme;
          setTheme(userTheme);
          localStorage.setItem("theme", userTheme);
          document.documentElement.classList.toggle("dark", userTheme === "dark");
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
      }
    };

    loadUserThemePreference();
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const saveThemePreference = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const { data, error: fetchError } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        // Update existing preference
        const { error: updateError } = await supabase
          .from("user_preferences")
          .update({ theme })
          .eq("user_id", user.id);

        if (updateError) throw updateError;
      } else {
        // Insert new preference
        const { error: insertError } = await supabase
          .from("user_preferences")
          .insert({ user_id: user.id, theme });

        if (insertError) throw insertError;
      }

      toast({
        title: "Theme Saved",
        description: "Your theme preference has been saved.",
      });
    } catch (error: any) {
      console.error("Error saving theme preference:", error);
      toast({
        title: "Error",
        description: "Failed to save theme preference: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, saveThemePreference, isSaving }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
