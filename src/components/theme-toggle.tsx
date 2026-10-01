"use client";

import { useEffect, useState } from "react";
import { Icon, icons } from "@/components/icons";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage no disponible
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar entre tema claro y oscuro"
      className="flex size-9 items-center justify-center border border-line text-muted transition-colors hover:border-accent hover:text-accent"
    >
      {theme === "dark" ? (
        <Icon path={icons.sun} />
      ) : (
        <Icon path={icons.moon} />
      )}
    </button>
  );
}
