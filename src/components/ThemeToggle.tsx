"use client";
import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
  const s = (localStorage.getItem("theme") as any) || "dark";
  setTheme(s === "light" ? "light" : "dark");
  document.documentElement.classList.toggle("dark", s !== "light");
  }, []);

  const flip = () => {
  const next = theme === "dark" ? "light" : "dark";
  setTheme(next);
  localStorage.setItem("theme", next);
  document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
  <button
  onClick={flip}
  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
  title={theme === "dark" ? "Light mode" : "Dark mode"}
  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold transition active:scale-[0.98] ${className}`}
  style={{ borderColor: theme === "dark" ? "#2A3441" : "#E5E7EB", background: theme === "dark" ? "#111827" : "#FFFFFF", color: theme === "dark" ? "#F9FAFB" : "#111827" }}
  >
  <span className="text-[13px] leading-none">{theme === "dark" ? "☾" : "☀"}</span>
  <span className="hidden sm:inline">{theme === "dark" ? "Dark" : "Light"}</span>
  </button>
  );
}
