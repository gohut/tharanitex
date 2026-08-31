import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import AdminLayoutClient from "./AdminLayoutClient";
import {
  validateSession,
} from "@/lib/auth";
import {
  SESSION_COOKIE_NAME,
} from "@/types/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();

  /*
   * Admin login creates the normal TharaniTex session cookie.
   * admin_token is also supported for backwards compatibility.
   */
  const sessionToken =
    cookieStore.get(SESSION_COOKIE_NAME)?.value ||
    cookieStore.get("admin_token")?.value ||
    cookieStore.get("tharanitex_session")?.value ||
    null;

  if (!sessionToken) {
    redirect("/admin/login");
  }

  const user = await validateSession(sessionToken);

  /*
   * Never trust the presence of a cookie alone.
   * validateSession() checks the actual D1/KV session.
   */
  if (
    !user ||
    user.userType !== "admin" ||
    user.status === "Inactive"
  ) {
    redirect("/admin/login");
  }

  return (
    <AdminLayoutClient user={user}>
      {children}
    </AdminLayoutClient>
  );
}