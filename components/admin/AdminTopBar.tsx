import { logoutAction } from "@/app/admin/actions/auth";

export function AdminTopBar({ email }: { email: string }) {
  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-neutral-900">
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
        Signed in as {email}
      </div>
      <form action={logoutAction}>
        <button className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-400 hover:text-white">
          Sign out
        </button>
      </form>
    </div>
  );
}
