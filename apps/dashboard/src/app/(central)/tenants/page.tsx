import { ResourceScaffold } from "@/components/resource-scaffold";

export const metadata = { title: "Gimnasios" };

export default function Page() {
  return <ResourceScaffold title="Gimnasios" description="Alta, baja y estado de cada gimnasio (tenant) del SaaS." />;
}
