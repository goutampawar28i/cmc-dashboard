import { getDataset } from "@/lib/google/sheets";
import { buildCmcRows } from "@/lib/analytics/metrics";
import { Header } from "@/components/layout/Header";
import { CmcPerformanceTable } from "@/components/tables/CmcPerformanceTable";

export const dynamic = "force-dynamic";

export default async function CmcListPage() {
  const dataset = await getDataset();
  const rows = buildCmcRows(dataset);

  return (
    <>
      <Header
        title="CMC Performance"
        lastSynced={dataset.lastSynced}
        source={dataset.source}
      />

      <main className="min-h-full bg-[#f4f4f0] p-4 md:p-6 lg:p-8">

        {/* =====================================================
            PAGE INTRO
        ====================================================== */}

        <section className="mb-6">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#888888]">
                Performance Management
              </p>

              <h2 className="mt-1 text-xl font-black tracking-tight text-[#111111] md:text-2xl">
                CMC Performance
              </h2>

              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#777777]">
                Compare outreach activity, company engagement and conversion
                performance across CMCs.
              </p>

            </div>

            {/* Dataset count */}

            <div
              className="
                inline-flex
                w-fit
                items-center
                gap-3
                rounded-lg
                border-2
                border-[#111111]
                bg-white
                px-3
                py-2
                shadow-[3px_3px_0_#111111]
              "
            >

              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#999999]">
                  CMCs tracked
                </p>

                <p className="text-sm font-black text-[#111111]">
                  {rows.length}
                </p>
              </div>

              <div className="h-7 w-px bg-[#dedede]" />

              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#999999]">
                  Dataset
                </p>

                <p className="text-[10px] font-bold text-[#333333]">
                  {dataset.source === "cache" ? "Cached" : "Live"}
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            PERFORMANCE TABLE
        ====================================================== */}

        <section>

          <div
            className="
              overflow-hidden
              rounded-xl
              border-2
              border-[#111111]
              bg-white
              shadow-[5px_5px_0_#111111]
            "
          >

            <div className="border-b-2 border-[#111111] bg-[#111111] px-4 py-3 md:px-5">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#999999]">
                    CMC Directory
                  </p>

                  <h3 className="mt-0.5 text-sm font-black text-white">
                    Performance Comparison
                  </h3>

                </div>

                <span className="hidden text-[9px] font-bold uppercase tracking-wider text-[#777777] sm:block">
                  Outreach metrics
                </span>

              </div>

            </div>

            <div className="overflow-x-auto">

              <CmcPerformanceTable rows={rows} />

            </div>

          </div>

        </section>


        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className="mt-6 border-t-2 border-[#111111] pt-4">

          <div className="flex flex-col justify-between gap-2 text-[9px] font-bold uppercase tracking-wider text-[#999999] sm:flex-row">

            <span>
              CMC Outreach Dashboard
            </span>

            <span>
              {rows.length} CMC's in dataset
            </span>

          </div>

        </footer>

      </main>
    </>
  );
}