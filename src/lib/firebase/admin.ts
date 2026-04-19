import 'server-only'
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getAuth as getAdminAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore as getAdminFirestore, type Firestore } from 'firebase-admin/firestore'

let _app: App | undefined

function getApp(): App {
  if (_app) return _app
  const existing = getApps()[0]
  if (existing) {
    _app = existing
    return _app
  }
  _app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    }),
  })
  return _app
}

export function adminAuth(): Auth {
  return getAdminAuth(getApp())
}
export function adminDb(): Firestore {
  return getAdminFirestore(getApp())
}
