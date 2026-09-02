import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import AdminLayoutClient from "../AdminLayoutClient";
import {
  validateSession,
} from "@/lib/auth";
import {
  SESSION_COOKIE_NAME,
} from "@/types/auth";
import { verifyJWT } from "@/utils/jwt";
import { getJwtSecret } from "@/utils/jwt-secret";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }) {
  const cookieStore = await cookies();
  const { env } = await getCloudflareContext({ async: true }).catch(() => ({ env: undefined }));

  /*
   * Check admin session tokens.
   */
  const sessionToken =
    cookieStore.get("admin_token")?.value ||
    cookieStore.get(SESSION_COOKIE_NAME)?.value ||
    cookieStore.get("tharanitex_session")?.value ||
    null;

  if (!sessionToken) {
    redirect("/admin/login");
  }

  let user = await validateSession(sessionToken, env).catch(() => null);

  // If token is a JWT, verify payload as admin
  if (!user && typeof sessionToken === "string" && sessionToken.split(".").length === 3) {
    try {
      const secret = getJwtSecret(env);
      const payload = await verifyJWT(sessionToken, secret);
      if (payload && (payload.role === "admin" || payload.userType === "admin" || payload.role === "Super Admin")) {
        user = {
          id: payload.id,
          userId: payload.id,
          userType: "admin",
          role: payload.role || "Super Admin",
          roleId: payload.roleId || 1,
          name: payload.name || "Super Admin",
          fullName: payload.name || "Super Admin",
          email: payload.email || "",
          status: "Active",
        };
      }
    } catch {
      // JWT verification fallback
    }
  }

  /*
   * Strict server-side verification: user must be authenticated admin with Active status
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
