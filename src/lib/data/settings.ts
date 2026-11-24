import { adminDb } from "@/lib/firebase/admin";
import type { HeroSettings } from "@/lib/types";

export async function getHeroSettings(): Promise<HeroSettings> {
  try {
    const doc = await adminDb.collection("settings").doc("hero").get();
    const data = doc.data();
    return {
      imageUrl: typeof data?.imageUrl === "string" && data.imageUrl ? data.imageUrl : null,
      imagePath: typeof data?.imagePath === "string" && data.imagePath ? data.imagePath : null,
    };
  } catch {
    // Never break the homepage because of a settings read problem.
    return { imageUrl: null, imagePath: null };
  }
}
