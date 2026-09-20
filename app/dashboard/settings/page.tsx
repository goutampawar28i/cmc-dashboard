import { getDataset } from "@/lib/google/sheets";
import { Header } from "@/components/layout/Header";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const dataset = await getDataset();
  const googleConfigured = !!process.env.GOOGLE_SHEET_ID && dataset.source !== "mock";
  const authConfigured = !!process.env.GOOGLE_OAUTH_CLIENT_ID;

  const rows = [
    { label: "Google Sheets data source", value: googleConfigured ? "Connected" : "Using mock data (GOOGLE_SHEET_ID not set)" },
    { label: "Mentor sign-in (Google OAuth)", value: authConfigured ? "Configured" : "Not configured — dashboard is open in this environment" },
    { label: "Allowed mentor emails", value: process.env.ALLOWED_MENTOR_EMAILS || "Not restricted yet" },
    { label: "Data source", value: dataset.source },
    { label: "Last synced", value: dataset.lastSynced },
  ];

  return (
    <>
      <Header title="Settings" lastSynced={dataset.lastSynced} source={dataset.source} />
      <main className="p-6">
        <div className="card divide-y divide-line max-w-xl">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-muted">{r.label}</span>
              <span className="text-ink font-medium">{r.value}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted max-w-xl">
          See README.md in the project root for how to connect a real Google Sheet and restrict sign-in to your mentors.
        </p>
      </main>
    </>
  );
}
