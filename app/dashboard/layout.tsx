import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // In local dev without Google OAuth configured, session will be null but
  // ALLOWED_MENTOR_EMAILS being unset already lets sign-in succeed for
  // anyone; here we only hard-redirect once auth is actually configured.
  const authConfigured = !!process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (authConfigured) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
