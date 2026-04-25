import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/layout/AdminNav";
import { SessionProvider } from "next-auth/react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }
  
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-background">
        <AdminNav />
        <main className="max-w-5xl mx-auto px-4 py-6 pb-16">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
