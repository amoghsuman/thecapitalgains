import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="bg-[#FAFAF7] min-h-screen pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-8">
        <p className="text-[11px] uppercase tracking-[0.12em] font-medium text-[#8B7BAB] mb-3">
          DASHBOARD
        </p>
        <h1 className="text-[36px] font-bold text-[#1C0F3F] mb-4">
          Welcome back.
        </h1>
        <p className="text-[16px] text-[#4B3F6B] mb-10">
          Your dashboard is coming soon.
        </p>

        <div className="bg-white border border-[rgba(124,58,237,0.12)] rounded-2xl p-8 mb-8">
          <p className="text-[13px] text-[#8B7BAB] font-mono uppercase tracking-widest mb-1">
            SIGNED IN AS
          </p>
          <p className="text-[15px] text-[#1C0F3F] font-medium">
            {session.user.email}
          </p>
        </div>

        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#7C3AED] hover:text-[#1C0F3F] transition-colors"
        >
          ← Browse courses
        </Link>
      </div>
    </div>
  );
}
