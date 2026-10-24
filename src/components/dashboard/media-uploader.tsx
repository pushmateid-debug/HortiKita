"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/components/layout/auth-provider";
import { firestore } from "@/lib/firebase/firestore";

type ResourceType = "image" | "video";
type SignatureResponse = {
  apiKey: string;
  cloudName: string;
  folder: string;
  overwrite: boolean;
  publicId: string;
  resourceType: ResourceType;
  signature: string;
  timestamp: number;
  uploadPreset: string;
};
type CloudinaryResponse = {
  secure_url?: string;
  public_id?: string;
  resource_type?: string;
  format?: string;
  bytes?: number;
  error?: { message?: string };
};

function isSignatureResponse(value: unknown): value is SignatureResponse {
  if (typeof value !== "object" || value === null) return false;
  const signature = value as Record<string, unknown>;
  return typeof signature.apiKey === "string"
    && typeof signature.cloudName === "string"
    && typeof signature.folder === "string"
    && typeof signature.publicId === "string"
    && typeof signature.signature === "string"
    && typeof signature.timestamp === "number"
    && typeof signature.uploadPreset === "string"
    && (signature.resourceType === "image" || signature.resourceType === "video")
    && typeof signature.overwrite === "boolean";
}

const imageLimit = 10 * 1024 * 1024;
const videoLimit = 50 * 1024 * 1024;

function uploadToCloudinary(file: File, signature: SignatureResponse, onProgress: (percent: number) => void) {
  return new Promise<CloudinaryResponse>((resolve, reject) => {
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", signature.apiKey);
    body.append("timestamp", String(signature.timestamp));
    body.append("folder", signature.folder);
    body.append("public_id", signature.publicId);
    body.append("overwrite", String(signature.overwrite));
    body.append("upload_preset", signature.uploadPreset);
    body.append("signature", signature.signature);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/${signature.resourceType}/upload`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onerror = () => reject(new Error("Unggahan gagal tersambung ke Cloudinary. Periksa koneksi internet."));
    xhr.onload = () => {
      let response: CloudinaryResponse;
      try {
        response = JSON.parse(xhr.responseText) as CloudinaryResponse;
      } catch {
        reject(new Error("Respons Cloudinary tidak dapat dibaca."));
        return;
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(response.error?.message ?? `Cloudinary menolak unggahan (HTTP ${xhr.status}).`));
        return;
      }
      resolve(response);
    };
    xhr.send(body);
  });
}

export function MediaUploader() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [assetType, setAssetType] = useState("post");
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function chooseFile(selected: File | null) {
    setError("");
    setMessage("");
    if (!selected) {
      setFile(null);
      return;
    }
    const isImage = ["image/jpeg", "image/png", "image/webp"].includes(selected.type);
    const isVideo = ["video/mp4", "video/webm"].includes(selected.type);
    if (!isImage && !isVideo) {
      setFile(null);
      setError("Pilih gambar JPG, PNG, WebP atau video MP4, WebM.");
      return;
    }
    const maximum = isImage ? imageLimit : videoLimit;
    if (selected.size > maximum) {
      setFile(null);
      setError(`Ukuran ${isImage ? "gambar" : "video"} melebihi batas ${(maximum / (1024 * 1024)).toFixed(0)} MB.`);
      return;
    }
    setFile(selected);
  }

  async function handleUpload() {
    if (!file || !user || !firestore) {
      setError("Sesi Firebase atau database belum tersedia. Masuk kembali dan coba lagi.");
      return;
    }
    setBusy(true);
    setProgress(0);
    setError("");
    setMessage("");
    try {
      const idToken = await user.getIdToken();
      const signatureResponse = await fetch("/api/cloudinary/signature", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ assetType, bytes: file.size, contentType: file.type }),
      });
      const signatureData: unknown = await signatureResponse.json();
      if (!signatureResponse.ok) {
        const reason = typeof signatureData === "object" && signatureData !== null && "error" in signatureData ? String(signatureData.error) : "Permintaan unggah ditolak.";
        throw new Error(reason);
      }
      if (!isSignatureResponse(signatureData)) throw new Error("Data tanda tangan unggahan tidak valid.");
      const result = await uploadToCloudinary(file, signatureData, setProgress);
      if (!result.secure_url || !result.public_id || !result.resource_type || typeof result.bytes !== "number") {
        throw new Error("Cloudinary tidak mengembalikan metadata media yang lengkap.");
      }
      await addDoc(collection(firestore, "media"), {
        ownerId: user.uid,
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        format: result.format ?? "",
        bytes: result.bytes,
        createdAt: serverTimestamp(),
      });
      setMessage("Media berhasil diunggah dan metadata tersimpan.");
      setFile(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unggahan gagal. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="dashboard-panel upload-panel">
    <div className="panel-heading"><div><h2>Unggah media</h2><p>Gambar JPG, PNG, WebP maks. 10 MB · video MP4, WebM maks. 50 MB.</p></div></div>
    <label className="upload-type">Tujuan media<select value={assetType} onChange={(event) => setAssetType(event.target.value)}><option value="post">Cerita komunitas</option><option value="product">Produk</option><option value="avatar">Profil</option></select></label>
    <label className="upload-dropzone">Pilih foto atau video<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} /><small>Pratinjau file muncul sebelum unggah.</small></label>
    {preview && file && <div className="upload-preview">{file.type.startsWith("video/") ? <video src={preview} controls aria-label="Pratinjau video" /> : <img src={preview} alt={`Pratinjau ${file.name}`} />}<span>{file.name} · {(file.size / (1024 * 1024)).toFixed(2)} MB</span></div>}
    {busy && <div className="upload-progress" role="status"><span>Proses unggah: {progress}%</span><progress max="100" value={progress} /></div>}
    {error && <p className="upload-feedback error-message" role="alert">{error}</p>}
    {message && <p className="upload-feedback success-message" role="status">{message}</p>}
    <button className="button button-small" disabled={!file || busy} onClick={handleUpload}>{busy ? "Mengunggah..." : "Unggah media"}</button>
  </section>;
}
