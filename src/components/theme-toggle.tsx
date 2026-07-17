import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/contexts/theme-provider";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  const onToggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      title="Toggle theme"
      onClick={onToggleTheme}
    >
      {theme === "light" ? <Moon /> : <Sun />}
    </Button>
  );
}
