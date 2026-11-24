"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { del } from "@vercel/blob";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdminSession } from "@/lib/actions/auth";

/** Set (or clear, with imageUrl = null) the hero / festival banner background. */
export async function updateHeroSettingsAction(input: {
  imageUrl: string | null;
  imagePath: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdminSession();

    const imageUrl = input.imageUrl?.trim() || null;
    if (imageUrl) {
      let parsed: URL;
      try {
        parsed = new URL(imageUrl);
      } catch {
        throw new Error("Please enter a valid image URL (starting with https://).");
      }
      if (parsed.protocol !== "https:") throw new Error("Image URL must start with https://");
    }

    const ref = adminDb.collection("settings").doc("hero");
    const existing = await ref.get();
    const previousPath = existing.data()?.imagePath as string | null | undefined;
    const imagePath = imageUrl ? input.imagePath || null : null;

    await ref.set({ imageUrl, imagePath, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

    // Remove the previous uploaded banner from Blob storage once replaced / cleared.
    if (previousPath && previousPath !== imagePath) {
      await del(previousPath).catch(() => {});
    }

    revalidatePath("/");
    revalidatePath("/admin/hero");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update hero banner." };
  }
}
