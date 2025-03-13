
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
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
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching theme preference:", error.message);
        }

        if (data && data.theme) {
          setTheme(data.theme);
          localStorage.setItem("theme", data.theme);
          document.documentElement.classList.toggle("dark", data.theme === "dark");
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
      }
    };

    loadUserThemePreference();
  }, [user]);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    // Save to database if user is authenticated
    if (user) {
      try {
        await supabase
          .from("user_preferences")
          .update({ theme: newTheme })
          .eq("user_id", user.id);
      } catch (error) {
        console.error("Error saving theme preference:", error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
