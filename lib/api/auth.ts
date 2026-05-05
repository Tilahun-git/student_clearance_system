import { routes } from "@/lib/roles";

export function getRedirectByRole(role: string) {
  const match = routes.find(
    (r) => r.role === role.toUpperCase()
  );

  return match?.redirect || "/unauthorized";
}