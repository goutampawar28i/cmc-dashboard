"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatSyncTime } from "@/lib/utils";

export function Header({
  title,
  lastSynced,
  source,
}: {
  title: string;
  lastSynced: string;
  source: string;
}) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleRefresh() {
    setError(null);

    try {
      const res = await fetch("/api/refresh", {
        method: "POST",
      });

      const json = await res.json();

      if (!json.ok) {
        setError(json.error ?? "Unable to sync Google Sheets.");
      }
    } catch {
      setError(
        "Unable to sync Google Sheets. Showing the last successfully synchronized data."
      );
    } finally {
      startTransition(() => router.refresh());
    }
  }

  const isCached = source === "cache";

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#111111] bg-[#f4f4f0]/95 backdrop-blur-sm">

      <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 md:px-6 lg:px-8">

        {/* =====================================================
            LEFT — PAGE TITLE
        ====================================================== */}

        <div className="min-w-0">

          <div className="flex items-center gap-3">

            {/* Minimal accent */}
            <div className="h-8 w-1.5 shrink-0 rounded-full bg-[#ff5a36]" />

            <div className="min-w-0">

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#888888]">
                CMC Outreach
              </p>

              <h1 className="truncate text-lg font-black tracking-tight md:text-xl">
                {title}
              </h1>

            </div>

          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-md border-2 border-[#111111] bg-[#fff1f1] px-2.5 py-1.5 text-[10px] font-bold text-[#b91c1c] shadow-[2px_2px_0_#111111]">
              <span>!</span>

              <span className="truncate">
                {error}
              </span>
            </div>
          )}

        </div>

        {/* =====================================================
            RIGHT — SYNC + REFRESH
        ====================================================== */}

        <div className="flex shrink-0 items-center gap-3">

          {/* Sync information */}

          <div className="hidden items-center gap-2.5 rounded-lg border border-[#d6d6d2] bg-white px-3 py-2 sm:flex">

            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isCached
                  ? "bg-[#d97706]"
                  : "bg-[#16a34a]"
              }`}
            />

            <div>

              <p className="text-[9px] font-bold uppercase tracking-wider text-[#555]">
                {isCached ? "Cached" : "Live"}
              </p>

              <p className="text-[10px] text-[#999]">
                {formatSyncTime(lastSynced)}
              </p>

            </div>

          </div>

          {/* Refresh */}

          <button
            onClick={handleRefresh}
            disabled={isPending}
            aria-label="Refresh data"
            className="
              rounded-lg
              border-2
              border-[#111111]
              bg-[#ff5a36]
              px-3
              py-2.5
              text-xs
              font-bold
              text-white
              shadow-[4px_4px_0_#111111]
              transition-all
              duration-150
              hover:translate-x-[2px]
              hover:translate-y-[2px]
              hover:shadow-[2px_2px_0_#111111]
              active:translate-x-[4px]
              active:translate-y-[4px]
              active:shadow-none
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >

            <span className="flex items-center gap-2">

              <span
                className={isPending ? "animate-spin" : ""}
              >
                ↻
              </span>

              <span className="hidden sm:inline">
                {isPending
                  ? "Refreshing..."
                  : "Refresh Data"}
              </span>

              <span className="sm:hidden">
                {isPending ? "..." : "Refresh"}
              </span>

            </span>

          </button>

        </div>

      </div>

      {/* =====================================================
          MOBILE SYNC STATUS
      ====================================================== */}

      <div className="border-t border-[#dedede] bg-white px-4 py-2 sm:hidden">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <span
              className={`h-2 w-2 rounded-full ${
                isCached
                  ? "bg-[#d97706]"
                  : "bg-[#16a34a]"
              }`}
            />

            <span className="text-[9px] font-bold uppercase tracking-wider text-[#666]">
              {isCached ? "Cached Data" : "Live Data"}
            </span>

          </div>

          <span className="text-[9px] text-[#999]">
            {formatSyncTime(lastSynced)}
          </span>

        </div>

      </div>

    </header>
  );
}