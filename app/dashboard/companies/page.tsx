import { getDataset } from "@/lib/google/sheets";
import { Header } from "@/components/layout/Header";
import {
  CompanyTable,
  type CompanyTableRow,
} from "@/components/tables/CompanyTable";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const dataset = await getDataset();

  const cmcMap = new Map(
    dataset.cmcs.map((cmc) => [cmc.cmcId, cmc.name])
  );

  const rows: CompanyTableRow[] = dataset.companies.map((company) => {
    const records = dataset.activities.filter(
      (activity) => activity.companyId === company.companyId
    );

    const lastContact = records.reduce<string | null>((latest, record) => {
      if (!record.date) return latest;

      if (!latest || new Date(record.date) > new Date(latest)) {
        return record.date;
      }

      return latest;
    }, null);

    return {
      ...company,
      assignedCmcName: company.assignedCmcId
        ? cmcMap.get(company.assignedCmcId) ?? "Unassigned"
        : "Unassigned",
      lastContact,
    };
  });

  const interestedCount = rows.filter(
    (row) => row.status === "Interested"
  ).length;

  const approachedCount = rows.filter(
    (row) => row.lastContact
  ).length;

  const unassignedCount = rows.filter(
    (row) => row.assignedCmcName === "Unassigned"
  ).length;

  return (
    <>
      <Header
        title="Company Outreach Pipeline"
        lastSynced={dataset.lastSynced}
        source={dataset.source}
      />

      <main className="page-container">

        {/* =====================================================
            PAGE INTRO
        ====================================================== */}

        <section className="mb-8">

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

            <div>

              <p className="section-label">
                Outreach Management
              </p>

              <h2 className="page-title mt-1">
                Company Pipeline
              </h2>

              <p className="section-description max-w-2xl">
                Track company outreach, ownership, engagement status and
                upcoming follow-ups from one place.
              </p>

            </div>


            {/* =================================================
                SUMMARY
            ================================================== */}

            <div className="grid grid-cols-3 gap-3 sm:flex">

              <div className="card-sm min-w-[90px] px-3 py-2">

                <p className="section-label">
                  Companies
                </p>

                <p className="mt-1 text-base font-black text-ink">
                  {rows.length}
                </p>

              </div>


              <div className="card-sm min-w-[90px] px-3 py-2">

                <p className="section-label">
                  Contacted
                </p>

                <p className="mt-1 text-base font-black text-ink">
                  {approachedCount}
                </p>

              </div>


              <div className="card-sm min-w-[90px] px-3 py-2">

                <p className="section-label">
                  Interested
                </p>

                <p className="mt-1 text-base font-black text-success">
                  {interestedCount}
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            PIPELINE TABLE
        ====================================================== */}

        <section>

          <div className="table-wrapper">

            {/* TABLE HEADER */}

            <div className="border-b-2 border-ink bg-ink px-4 py-3 md:px-5">

              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

                <div>

                  <p className="section-label text-subtle">
                    Company Directory
                  </p>

                  <h3 className="mt-1 text-sm font-black text-white">
                    Outreach Pipeline
                  </h3>

                </div>


                <div className="flex items-center gap-3">

                  {unassignedCount > 0 && (
                    <span className="badge badge-warning">
                      {unassignedCount} unassigned
                    </span>
                  )}

                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    {rows.length} records
                  </span>

                </div>

              </div>

            </div>


            {/* TABLE */}

            <div className="overflow-x-auto">

              <CompanyTable rows={rows} />

            </div>

          </div>

        </section>


        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className="mt-8 border-t border-line pt-4">

          <div className="flex flex-col justify-between gap-2 text-[9px] font-bold uppercase tracking-wider text-subtle sm:flex-row">

            <span>
              Developed by Goutam Pawar
            </span>

            <span>
              CMC Coordinator
            </span>

            <span>
              Company Pipeline
            </span>

          </div>

        </footer>

      </main>
    </>
  );
}