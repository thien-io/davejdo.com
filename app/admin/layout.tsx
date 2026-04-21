import { Toaster } from "sonner";
import { createClient } from "@/lib/supabase/server";
import { AdminRail } from "@/components/admin/AdminRail";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

const ADMIN_EMAIL = "davejdo6@gmail.com";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const isAdmin = data.user?.email === ADMIN_EMAIL;

  // The login page (/admin/login) is the only unauthenticated-reachable
  // admin route — it renders fine without the rail. Any other admin page
  // calls requireAdmin() at the top and redirects to /admin/login on its own.
  return (
    <div className="min-h-screen bg-black text-white font-body grain-overlay">
      <Toaster position="bottom-right" richColors closeButton />
      {isAdmin ? (
        <div className="flex min-h-screen">
          <AdminRail />
          <div className="flex-1 flex flex-col">
            <AdminTopBar email={data.user!.email!} />
            <main className="flex-1 p-8">{children}</main>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
