"use client";

import { ResourceHeader } from "@/features/_shared";
import { SettingGroupForm } from "./components/setting-group-form";
import { SETTING_GROUPS } from "./lib/site-settings.lib";

export function SiteSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Sitio web"
        description="Banner, WhatsApp y flags que consume la web pública."
      />
      {SETTING_GROUPS.map((group) => (
        <SettingGroupForm key={group.key} group={group} />
      ))}
    </div>
  );
}
