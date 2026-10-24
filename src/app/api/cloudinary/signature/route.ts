import { NextResponse } from "next/server";
import { signCloudinaryUpload } from "@/lib/cloudinary/signature";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";

export const runtime = "nodejs";

const mediaLimits = {
  image: { maxBytes: 10 * 1024 * 1024, contentTypes: ["image/jpeg", "image/png", "image/webp"] },
  video: { maxBytes: 50 * 1024 * 1024, contentTypes: ["video/mp4", "video/webm"] },
} as const;
const assetTypes = ["avatar", "post", "product", "cohort", "organization"] as const;
type AssetType = (typeof assetTypes)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !apiKey || !apiSecret || !uploadPreset) {
    return errorResponse("Konfigurasi Cloudinary belum lengkap di environment server.", 503);
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return errorResponse("Sesi Firebase diperlukan untuk meminta tanda tangan unggahan.", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Permintaan unggah harus berupa JSON yang valid.", 400);
  }
  if (!isRecord(body)) return errorResponse("Data unggah tidak valid.", 400);

  const contentType = typeof body.contentType === "string" ? body.contentType : "";
  const bytes = typeof body.bytes === "number" ? body.bytes : 0;
  const assetType = typeof body.assetType === "string" ? body.assetType : "";
  const cohortId = typeof body.cohortId === "string" ? body.cohortId : "";
  const resourceType = contentType.startsWith("image/") ? "image" : contentType.startsWith("video/") ? "video" : "";
  if (!resourceType || !assetTypes.includes(assetType as AssetType)) {
    return errorResponse("Jenis media atau tujuan unggah tidak didukung.", 400);
  }
  const limits = mediaLimits[resourceType];
  if (
    !(limits.contentTypes as readonly string[]).includes(contentType)
    || !Number.isSafeInteger(bytes)
    || bytes < 1
    || bytes > limits.maxBytes
  ) {
    return errorResponse("Format file tidak didukung atau ukuran file melebihi batas.", 400);
  }
  if (["cohort", "organization"].includes(assetType) && !cohortId) {
    return errorResponse("ID ruang lingkup diperlukan untuk unggahan organisasi atau angkatan.", 400);
  }

  try {
    const identity = await getAdminAuth().verifyIdToken(authorization.slice("Bearer ".length), true);
    const database = getAdminFirestore();
    const profile = await database.collection("users").doc(identity.uid).get();
    if (!profile.exists) return errorResponse("Profil pengguna belum terdaftar.", 403);
    const profileData = profile.data();
    const isPlatformAdmin = profileData?.role === "platformAdmin";

    if (assetType === "cohort" && !isPlatformAdmin) {
      const cohort = await database.collection("cohorts").doc(cohortId).get();
      const adminIds = cohort.data()?.adminIds;
      if (!Array.isArray(adminIds) || !adminIds.includes(identity.uid)) {
        return errorResponse("Hanya pengurus terverifikasi yang dapat mengunggah sampul angkatan.", 403);
      }
    }
    if (assetType === "organization" && !isPlatformAdmin) {
      const organization = await database.collection("organizations").doc(cohortId).get();
      const adminIds = organization.data()?.adminIds;
      if (!Array.isArray(adminIds) || !adminIds.includes(identity.uid)) {
        return errorResponse("Hanya pengurus terverifikasi yang dapat mengunggah media organisasi.", 403);
      }
    }

    const folder = `hortikita/${assetType === "avatar" || assetType === "post" || assetType === "product" ? identity.uid : cohortId}/${assetType}`;
    const { publicId, signature, timestamp } = signCloudinaryUpload({ apiSecret, folder, uploadPreset });

    return NextResponse.json({
      apiKey,
      cloudName,
      folder,
      overwrite: false,
      publicId,
      resourceType,
      signature,
      timestamp,
      uploadPreset,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
    if (code.includes("auth/")) return errorResponse("Sesi Firebase tidak valid atau sudah kedaluwarsa.", 401);
    console.error("Cloudinary signature request failed:", error);
    return errorResponse("Layanan unggah belum siap. Periksa kredensial Firebase Admin di server.", 503);
  }
}
