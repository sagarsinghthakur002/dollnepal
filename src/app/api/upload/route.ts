import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/actions/auth";

// Issues short-lived, admin-only tokens that let the browser upload product
// photos directly to Vercel Blob storage (bypassing this server for the
// actual file bytes, so large images don't count against function limits).
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Only a signed-in admin may request an upload token.
        await requireAdminSession();

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          addRandomSuffix: true,
          maximumSizeInBytes: 8 * 1024 * 1024, // 8 MB
        };
      },
      onUploadCompleted: async () => {
        // No-op: the client stores the returned blob URL on the product itself.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 }
    );
  }
}
