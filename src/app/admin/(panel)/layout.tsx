import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { adminSessionEpoch, adminUnreadMessageCount } from "@/lib/data";

export default async function AdminPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    redirect("/admin/login");
  }

  // Revocación: el epoch del token debe coincidir con el de la cuenta.
  const epoch = await adminSessionEpoch(session.email);
  if (epoch === null || epoch !== session.epoch) {
    redirect("/admin/login");
  }

  const unread = await adminUnreadMessageCount();

  return (
    <AdminShell email={session.email} unread={unread}>
      {children}
    </AdminShell>
  );
}
