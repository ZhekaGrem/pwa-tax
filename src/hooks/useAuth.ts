'use client'
import { useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase/client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(
    () =>
      onAuthStateChanged(getFirebaseAuth(), (u) => {
        setUser(u)
        setLoading(false)
      }),
    [],
  )
  return {
    user,
    loading,
    signInWithGoogle: () => signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider()),
    signOut: () => signOut(getFirebaseAuth()),
  }
}
