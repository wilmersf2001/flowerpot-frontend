import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

/** `/settings` no tiene contenido propio: entra a la primera sección. */
export default function Page() {
  redirect(ROUTES.tenant.settingsCompany);
}
