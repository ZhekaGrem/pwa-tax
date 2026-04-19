'use client'
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore'
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth'

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

let _app: FirebaseApp | undefined
let _db: Firestore | undefined
let _auth: Auth | undefined

export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app
  _app = getApps()[0] ?? initializeApp(config)
  return _app
}

export function getDb(): Firestore {
  if (_db) return _db
  const app = getFirebaseApp()
  _db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    connectFirestoreEmulator(_db, '127.0.0.1', 8080)
  }
  return _db
}

export function getFirebaseAuth(): Auth {
  if (_auth) return _auth
  _auth = getAuth(getFirebaseApp())
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    connectAuthEmulator(_auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  }
  return _auth
}
