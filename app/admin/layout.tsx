import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { isWhatsAppConfigured } from "@/lib/whatsapp";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="admin-shell flex min-h-screen bg-slate-950 text-slate-200">
      <AdminSidebar
        email={session?.user?.email}
        whatsAppConfigured={isWhatsAppConfigured()}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-slate-800 bg-slate-900/50 px-6 lg:hidden">
          <p className="font-semibold text-white">Tourist Admin</p>
        </header>
        <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
