# CMC Corporate Outreach Dashboard

A mentor-facing monitoring dashboard for a college placement/corporate-relations team. 30+ CMCs (Career Management Coordinators) log outreach activity in Google Sheets; this app reads that data, calculates metrics, and visualizes the whole pipeline for the mentor. **Google Sheets stays the single source of truth** — this app never writes to it.

Runs out of the box on **mock data** so you can explore the whole UI before connecting a real spreadsheet.

## What's included

- **Overview** — KPI cards, outreach funnel, "Attention Required" alerts, daily activity chart, live activity feed
- **CMC Performance** — sortable/searchable table of all CMCs, click through to a full profile page per CMC
- **Company Pipeline** — filterable table of every company, click through to a CRM-style outreach history timeline
- **Follow-ups** — Overdue / Due Today / Due This Week / Upcoming, grouped and sorted
- **Duplicates** — flags any company being contacted by more than one CMC
- **Data Quality** — validates every activity record (missing IDs, bad emails, invalid dates, missing follow-up dates) and shows a quality score
- **Analytics** — industry breakdown, CMC activity heatmap
- Google sign-in restricted to an allowlist of mentor emails
- Server-side only Google API credentials — nothing touches the browser

## 1. Local development (mock data, no setup required)

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll land on the dashboard populated with realistic mock data (12 CMCs, ~100 companies, ~550 activity records, including deliberate duplicates and data-quality issues so every page has something to show).

Sign-in is **not enforced** locally until you set `GOOGLE_OAUTH_CLIENT_ID` — this lets you build and demo the UI before Google Cloud is set up.

## 2. Connect your real Google Sheet

### 2a. Set up the spreadsheet

Create one Google Sheet with these tabs:

- `CMC_Master` — columns: `CMC_ID | Name | Email | Batch | Active | Assigned_Target`
- `Company_Master` — columns: `Company_ID | Company_Name | Industry | Website | Assigned_CMC | Primary_Contact | Contact_Email | Contact_Phone | Status | Created_Date`
- One tab per CMC, named after their name with spaces replaced by underscores (e.g. `Rahul_Sharma`), all sharing this exact column order:
  `Date | Company_ID | Company_Name | Industry | Contact_Name | Contact_Designation | Contact_Email | Contact_Phone | Outreach_Channel | Activity | Pitch_Type | Status | Next_Followup | Response | Meeting_Date | Campus_Visit_Date | Remarks`

Use these standardized dropdown values (Data Validation in Sheets) so the metrics stay consistent:

- **Outreach Channel**: Email, Phone Call, LinkedIn, Alumni Reference, Personal Network, Company Website, WhatsApp, Other
- **Activity**: Company Targeted, Contact Identified, Initial Outreach, Email Sent, Call Made, LinkedIn Outreach, Pitch Sent, Follow-up, Meeting, Proposal Sent, Campus Visit Discussion, Campus Visit Confirmed
- **Pitch Type**: Placement, Internship, Live Project, Corporate Interaction, Guest Session, Industrial Visit, Sponsorship, Other
- **Status**: Targeted, Contacted, No Response, Follow-up Required, Interested, Discussion Scheduled, Proposal Sent, Confirmed, Rejected, Not Relevant
- **Response**: No Response, Positive, Negative, Requested More Information, Meeting Requested, Interested

### 2b. Create a Google Cloud service account (read-only access to the sheet)

1. Go to [console.cloud.google.com](https://console.cloud.google.com), create or select a project.
2. Enable the **Google Sheets API** (APIs & Services → Library).
3. APIs & Services → Credentials → Create Credentials → **Service Account**. Give it any name (e.g. `cmc-dashboard-reader`).
4. Open the new service account → Keys → Add Key → **Create new key** → JSON. Download it.
5. From the downloaded JSON, copy `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `private_key` → `GOOGLE_PRIVATE_KEY`.
6. **Share your Google Sheet** with that `client_email` address, Viewer access.
7. Copy the spreadsheet ID from its URL (`https://docs.google.com/spreadsheets/d/THIS_PART/edit`) → `GOOGLE_SHEET_ID`.

### 2c. Set environment variables

Copy `.env.example` to `.env.local` and fill in the three Google Sheets values above. Restart `npm run dev` — the app will now read live from your sheet, refreshing every 3–5 minutes, with a manual **Refresh Data** button on every page.

If the Sheets API call fails for any reason, the dashboard keeps showing the last successfully synced data with a clear "last synced" timestamp rather than breaking.

## 3. Restrict sign-in to your mentors

1. In the same Google Cloud project, go to APIs & Services → Credentials → Create Credentials → **OAuth client ID** → Web application.
2. Add an authorized redirect URI: `https://YOUR_DEPLOYMENT_URL/api/auth/callback/google` (and `http://localhost:3000/api/auth/callback/google` for local testing).
3. Copy the Client ID and Secret into `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET`.
4. Generate a secret for NextAuth: `openssl rand -base64 32` → `NEXTAUTH_SECRET`.
5. Set `ALLOWED_MENTOR_EMAILS` to a comma-separated list of the Google accounts allowed to sign in.

Students never get dashboard accounts in this version — their Google Sheet tab is their entire interface.

## 4. Deploy to Vercel

1. Push this project to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. In the project's Environment Variables settings, add everything from `.env.example` with your real values. For `NEXTAUTH_URL`, use your production URL (e.g. `https://cmc-dashboard.vercel.app`).
4. For `GOOGLE_PRIVATE_KEY`, paste it with literal `\n` line breaks (Vercel's env var UI handles this fine; the app un-escapes them at runtime) — or paste it as a multi-line value if Vercel's UI supports that for your account.
5. Deploy. Update your OAuth redirect URI (step 3.2 above) to match the real Vercel URL once you have it.

No database, no persistent filesystem, and no long-running processes are used anywhere — everything is either a serverless function or a static route, so it deploys cleanly.

## Project structure

```
app/
  dashboard/            # every mentor-facing page (App Router)
  api/auth/[...nextauth] # Google sign-in
  api/refresh            # manual "Refresh Data" endpoint
  login/
lib/
  google/sheets.ts       # the ONLY file that talks to the Sheets API
  analytics/metrics.ts   # every metric definition, in one place
  mock/generateMockData.ts
  auth.ts
  utils.ts
components/
  layout/                # Sidebar, Header
  dashboard/              # KPI cards, attention list, activity feed
  charts/                 # funnel, daily activity, heatmap
  tables/                 # CMC + company tables (sort/search/filter)
  ui/                     # status badge
types/index.ts
```

## Notes on the metric definitions

The one rule that matters most throughout `lib/analytics/metrics.ts`: **outreach activities and unique companies are always counted separately.** Three emails and two calls to the same company is 5 outreach activities but 1 company approached — every aggregate in this app respects that distinction so numbers can't be inflated by repeated contact with the same company.

Anything the app can't reliably calculate from the sheet shows as `—` rather than a fabricated number.

## Extending this

- **CMC sheet auto-discovery**: currently a CMC's tab name is derived from their name in `CMC_Master`. If you'd rather store the exact tab name explicitly, add a `Sheet_Name` column and read it instead of deriving it in `lib/google/sheets.ts`.
- **Caching**: the in-memory cache in `lib/google/sheets.ts` is per-serverless-instance, which is fine at this scale. If you outgrow it, swap in Vercel KV or Redis.
- **Students**: this version is mentor-only by design. A student-facing read-only view of their own sheet would be a separate, simpler route with its own auth check.
