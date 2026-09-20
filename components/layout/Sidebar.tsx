"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/cmc", label: "CMC Performance" },
  { href: "/dashboard/companies", label: "Companies" },
  { href: "/dashboard/followups", label: "Follow-ups" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/duplicates", label: "Duplicates" },
  { href: "/dashboard/data-quality", label: "Data Quality" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r-2 border-[#111111] bg-[#f4f4f0] md:flex">

      {/* =====================================================
          BRAND
      ====================================================== */}

      <div className="border-b-2 border-[#111111] p-5">

        <div className="flex items-center gap-3">

          {/* Logo */}

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-lg
              border-2
              border-[#111111]
              bg-[#ff5a36]
              text-[10px]
              font-black
              tracking-tight
              text-white
              shadow-[3px_3px_0_#111111]
            "
          >
            CMC
          </div>

          {/* Brand */}

          <div className="min-w-0">

            <p className="text-sm font-black leading-none tracking-tight">
              CMC
            </p>

            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#888888]">
              Oureach Dashboard
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <nav className="flex-1 px-4 py-5">

        <p className="mb-3 px-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#888888]">
          Workspace
        </p>

        <div className="space-y-2">

          {NAV.map((item) => {

            const active =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  `
                    group
                    relative
                    flex
                    min-h-[42px]
                    items-center
                    justify-between
                    rounded-lg
                    border-2
                    border-[#111111]
                    px-3
                    text-xs
                    font-bold
                    transition-all
                    duration-150
                  `,
                  active
                    ? `
                      translate-x-[3px]
                      translate-y-[3px]
                      bg-[#ff5a36]
                      text-white
                      shadow-none
                    `
                    : `
                      bg-white
                      text-[#222222]
                      shadow-[3px_3px_0_#111111]
                      hover:translate-x-[1px]
                      hover:translate-y-[1px]
                      hover:shadow-[2px_2px_0_#111111]
                    `
                )}
              >
                <span>{item.label}</span>

                {active && (
                  <span className="text-base leading-none">
                    →
                  </span>
                )}
              </Link>
            );
          })}

        </div>

      </nav>

      {/* =====================================================
          SYSTEM STATUS
      ====================================================== */}

      <div className="px-4 pb-4">

        <div
          className="
            rounded-lg
            border-2
            border-[#111111]
            bg-white
            p-3
            shadow-[3px_3px_0_#111111]
          "
        >

          <div className="flex items-center gap-2">

            <span className="relative flex h-2.5 w-2.5">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16a34a] opacity-40" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#16a34a]" />

            </span>

            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#333333]">
              System Online
            </span>

          </div>

          <p className="mt-2 text-[9px] leading-relaxed text-[#888888]">
            Dashboard services are running normally.
          </p>

        </div>

      </div>

      {/* =====================================================
          SETTINGS
      ====================================================== */}

      <div className="border-t-2 border-[#111111] bg-white p-4">

        <Link
          href="/dashboard/settings"
          className={cn(
            `
              flex
              min-h-[42px]
              items-center
              justify-between
              rounded-lg
              border-2
              border-[#111111]
              px-3
              text-xs
              font-bold
              transition-all
              duration-150
            `,
            pathname.startsWith("/dashboard/settings")
              ? `
                translate-x-[3px]
                translate-y-[3px]
                bg-[#111111]
                text-white
                shadow-none
              `
              : `
                bg-white
                text-[#222222]
                shadow-[3px_3px_0_#111111]
                hover:translate-x-[1px]
                hover:translate-y-[1px]
                hover:shadow-[2px_2px_0_#111111]
              `
          )}
        >
          <span>Settings</span>

          <span className="text-sm">
            ⚙
          </span>

        </Link>

      </div>

    </aside>
  );
}