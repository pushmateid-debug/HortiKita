import "server-only";

import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App | null = null;

export function getFirebaseAdmin() {
  if (adminApp) return adminApp;
  const existingApp = getApps().find((app) => app.name === "hortikita-admin");
  if (existingApp) {
    adminApp = existingApp;
    return adminApp;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    let serviceAccount: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(serviceAccountJson);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("Bentuk JSON service account tidak valid.");
      }
      serviceAccount = parsed as Record<string, unknown>;
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON bukan JSON service account yang valid.");
    }
    const projectId = serviceAccount.project_id ?? serviceAccount.projectId;
    const clientEmail = serviceAccount.client_email ?? serviceAccount.clientEmail;
    const privateKey = serviceAccount.private_key ?? serviceAccount.privateKey;
    if (typeof projectId !== "string" || typeof clientEmail !== "string" || typeof privateKey !== "string") {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON tidak memiliki project_id, client_email, atau private_key.");
    }
    adminApp = initializeApp(
      {
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      },
      "hortikita-admin",
    );
  } else {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) throw new Error("Kredensial Firebase Admin belum dikonfigurasi.");
    adminApp = initializeApp({ credential: applicationDefault(), projectId }, "hortikita-admin");
  }
  return adminApp;
}

export function getAdminAuth() {
  return getAuth(getFirebaseAdmin());
}

export function getAdminFirestore() {
  return getFirestore(getFirebaseAdmin());
}
