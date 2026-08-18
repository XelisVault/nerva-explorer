"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SunIcon, MoonIcon, MenuIcon, CloseIcon, SearchIcon } from "./icons";
import { config } from "@/config/config";

const NAV_ITEMS = [
  { label: "Network", href: "#network" },
  { label: "Blocks", href: "#blocks" },
  { label: "Mempool", href: "#mempool" },
  { label: "Charts", href: "#charts" },
  { label: "Tools", href: "#tools" },
];

// External links shown in the header, sourced from the shared config so
// forks only need to override config.links to update them everywhere.
const EXTERNAL_LINKS = [
  { label: "Website", href: config.links.website },
  { label: "Docs", href: config.links.docs },
  { label: "GitHub", href: config.links.github },
  { label: "Discord", href: config.links.discord },
];

export default function Header({ onSearch }: { onSearch?: (q: string) => void }) {
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => setIsDark(document.documentElement.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("nerva-explorer-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("nerva-explorer-theme", "light");
    }
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (q && onSearch) onSearch(q);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b backdrop-blur-xl" : ""
      }`}
      style={{
        background: scrolled
          ? "color-mix(in srgb, var(--clr-bg) 85%, transparent)"
          : "var(--clr-bg)",
        borderColor: scrolled ? "var(--clr-border)" : "transparent",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2.5 group" aria-label="Nerva Explorer">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--brand-teal)] to-[var(--brand-purple)] opacity-30 blur-md transition-opacity group-hover:opacity-60" />
            <img
              src="/explorer/logo-color.png"
              alt="Nerva"
              width={32}
              height={32}
              className="relative h-8 w-8 rounded-lg"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span
              className="text-base font-bold tracking-tight"
              style={{ color: "var(--clr-text)" }}
            >
              Nerva<span className="gradient-text"> Explorer</span>
            </span>
            <span
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "var(--clr-text-muted)" }}
            >
              XNV Blockchain
            </span>
          </div>
        </a>

        {/* Search bar (desktop) */}
        <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <SearchIcon
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "var(--clr-text-muted)" }}
            />
            <input
              ref={searchRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search block height, hash, or tx id..."
              className="w-full rounded-full border bg-[var(--clr-bg-surface)] py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-[var(--clr-accent)]"
              style={{ color: "var(--clr-text)" }}
            />
          </div>
        </form>

        {/* Right side */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-[var(--clr-bg-hover)]"
              style={{ color: "var(--clr-text-muted)" }}
            >
              {item.label}
            </a>
          ))}

          <div className="mx-1 h-5 w-px" style={{ background: "var(--clr-border)" }} />

          {EXTERNAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-full px-2.5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-[var(--clr-bg-hover)]"
              style={{ color: "var(--clr-text-muted)" }}
              title={link.label}
            >
              {link.label === "GitHub" ? "GH" : link.label === "Discord" ? "DC" : link.label.slice(0, 2)}
            </a>
          ))}

          <button
            type="button"
            onClick={toggleDark}
            className="ml-2 rounded-full p-2 transition-colors hover:bg-[var(--clr-bg-hover)]"
            aria-label="Toggle dark mode"
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <SunIcon className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MoonIcon className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile right */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            type="button"
            onClick={toggleDark}
            className="rounded-full p-2"
            aria-label="Toggle dark mode"
          >
            {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-full p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t md:hidden"
            style={{
              background: "var(--clr-bg)",
              borderColor: "var(--clr-border)",
            }}
          >
            <div className="space-y-3 px-4 py-4">
              <form onSubmit={submitSearch}>
                <div className="relative">
                  <SearchIcon
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: "var(--clr-text-muted)" }}
                  />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search block or tx..."
                    className="w-full rounded-full border bg-[var(--clr-bg-surface)] py-2 pl-10 pr-4 text-sm outline-none"
                  />
                </div>
              </form>
              <div className="grid grid-cols-3 gap-2">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg border px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider"
                    style={{
                      borderColor: "var(--clr-border)",
                      color: "var(--clr-text-muted)",
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
