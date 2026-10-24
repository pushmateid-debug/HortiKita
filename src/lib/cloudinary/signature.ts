import "server-only";

import { createHmac, randomUUID } from "node:crypto";

export type CloudinaryResourceType = "image" | "video";

export function signCloudinaryUpload(
  options: {
    apiSecret: string;
    folder: string;
    uploadPreset: string;
  },
  timestamp = Math.floor(Date.now() / 1000),
) {
  const publicId = randomUUID();
  const parameters = {
    folder: options.folder,
    overwrite: "false",
    public_id: publicId,
    timestamp: String(timestamp),
    upload_preset: options.uploadPreset,
  };
  const signatureBase = Object.entries(parameters)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return {
    publicId,
    signature: createHmac("sha1", options.apiSecret).update(signatureBase).digest("hex"),
    timestamp,
  };
}
