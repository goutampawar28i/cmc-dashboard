import type { ActivityRecord } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

function describe(a: ActivityRecord): string {
  switch (a.activity) {
    case "Email Sent": return `sent an email to ${a.companyName}`;
    case "Call Made": return `called ${a.companyName}`;
    case "LinkedIn Outreach": return `reached out to ${a.companyName} on LinkedIn`;
    case "Pitch Sent": return `sent a pitch to ${a.companyName}`;
    case "Follow-up": return `completed a follow-up with ${a.companyName}`;
    case "Meeting": return `logged a meeting with ${a.companyName}`;
    case "Campus Visit Confirmed": return `confirmed a campus visit with ${a.companyName}`;
    case "Company Targeted": return `added ${a.companyName} as a target`;
    default: return `logged "${a.activity}" for ${a.companyName}`;
  }
}

export function ActivityFeed({ activities }: { activities: ActivityRecord[] }) {
  const sorted = [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 12);
  return (
    <div className="card divide-y divide-line">
      {sorted.map((a) => (
        <div key={a.recordId} className="px-4 py-3 text-sm">
          <p className="text-ink">
            <span className="font-medium">{a.cmcName}</span> {describe(a)}
          </p>
          <p className="mt-0.5 text-xs text-muted">{formatRelativeTime(a.date)}</p>
        </div>
      ))}
      {sorted.length === 0 && <p className="px-4 py-6 text-sm text-muted">No recent activity.</p>}
    </div>
  );
}
