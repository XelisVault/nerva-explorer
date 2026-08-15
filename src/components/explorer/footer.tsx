"use client";

const FOOTER_LINKS = [
  {
    title: "Explorer",
    links: [
      { label: "Network Stats", href: "#network" },
      { label: "Recent Blocks", href: "#blocks" },
      { label: "Mempool", href: "#mempool" },
      { label: "Charts", href: "#charts" },
      { label: "Tools", href: "#tools" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Website", href: "https://nerva.one" },
      { label: "Documentation", href: "https://docs.nerva.one" },
      { label: "Mining Calculator", href: "https://nerva.one/nerva-mining-profitability-calculator/" },
      { label: "Node Map", href: "https://map.nerva.one/" },
      { label: "Donate", href: "https://nerva.one/donate/" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Discord", href: "https://discord.com/invite/jsdbEns/" },
      { label: "Telegram", href: "https://t.me/NervaCrypto" },
      { label: "Twitter", href: "http://twitter.com/NervaCurrency" },
      { label: "Reddit", href: "https://www.reddit.com/r/NervaCrypto" },
      { label: "GitHub", href: "https://github.com/nerva-project" },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden border-t"
      style={{
        background: "var(--clr-bg-secondary)",
        borderColor: "var(--clr-border)",
      }}
    >
      <div
        className="h-1 w-full"
        style={{
          background: "linear-gradient(90deg, var(--brand-teal), var(--brand-purple))",
        }}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--brand-teal)] to-[var(--brand-purple)] opacity-40 blur-md" />
                <img
                  src="/explorer/logo-color.png"
                  alt="Nerva"
                  width={36}
                  height={36}
                  className="relative h-9 w-9 rounded-lg"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold" style={{ color: "var(--clr-text)" }}>
                  Nerva<span className="gradient-text"> Explorer</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--clr-text-muted)" }}>
                  XNV Blockchain
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--clr-text-muted)" }}>
              Real-time Nerva (XNV) blockchain explorer. Track blocks, transactions, mining stats,
              and network health. Open-source and community-driven.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4
                className="mb-4 text-xs font-bold uppercase tracking-widest"
                style={{ color: "var(--clr-accent)" }}
              >
                {col.title}
              </h4>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                      className="transition-colors hover:text-[var(--clr-accent)]"
                      style={{ color: "var(--clr-text-muted)" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs sm:flex-row"
          style={{ borderColor: "var(--clr-border)" }}
        >
          <p style={{ color: "var(--clr-text-muted)" }}>
            &copy; {new Date().getFullYear()} The Nerva Project. Open-source under MIT License.
          </p>
          <p style={{ color: "var(--clr-text-muted)" }}>
            Data refreshed every 15 seconds · Powered by Nerva RPC API
          </p>
        </div>
      </div>
    </footer>
  );
}
