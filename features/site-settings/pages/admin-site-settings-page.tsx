import { getSiteSettings } from "../actions/get-settings";
import { SiteSettingsForm } from "../components/site-settings-form";
import { Globe } from "lucide-react";

export default async function AdminSiteSettingsPage() {
  const showPameran = await getSiteSettings();

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#33A5D3]/10 rounded-lg">
            <Globe className="h-6 w-6 text-[#33A5D3]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Pengaturan Website</h2>
            <p className="text-gray-400 text-sm mt-1">
              Kontrol visibilitas bagian-bagian situs untuk pengunjung
            </p>
          </div>
        </div>
      </header>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <SiteSettingsForm showPameran={showPameran} />
      </div>
    </div>
  );
}