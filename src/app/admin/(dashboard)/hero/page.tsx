import HeroManager from "@/components/admin/HeroManager";
import { getHeroSettings } from "@/lib/data/settings";

export const dynamic = "force-dynamic";

export default async function AdminHeroPage() {
  const hero = await getHeroSettings();
  return <HeroManager initial={hero} />;
}
