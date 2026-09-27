import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const USE_EMULATORS = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

if (USE_EMULATORS) {
  // These env vars are what each Admin SDK service checks internally to
  // redirect calls to the local Firebase Emulator Suite instead of prod.
  process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

function createAdminApp(): App {
  if (getApps().length) return getApps()[0]!;

  // Real service-account credentials, for a live Firebase project.
  if (clientEmail && privateKey) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  // Emulator mode (or no credentials configured yet): the emulator doesn't
  // validate credentials, so a bare projectId is enough to talk to it.
  return initializeApp({ projectId });
}

const app = createAdminApp();

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);
