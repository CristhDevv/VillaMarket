import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { SessionProvider } from "next-auth/react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="max-w-2xl mx-auto px-4 py-6 pb-16">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
