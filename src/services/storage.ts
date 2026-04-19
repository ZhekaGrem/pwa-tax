'use client'
import { addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore'
import { getDb } from '@/lib/firebase/client'
import type { Appeal } from '@/schemas/appeal'

export async function createDraftAppeal(
  uid: string,
  data: Omit<Appeal, 'id' | 'ownerUid' | 'status' | 'calculation'>,
) {
  const col = collection(getDb(), 'appeals', uid, 'properties')
  const ref = await addDoc(col, {
    ...data,
    ownerUid: uid,
    status: 'draft' as const,
    calculation: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateAppeal(uid: string, id: string, patch: Partial<Appeal>) {
  const ref = doc(getDb(), 'appeals', uid, 'properties', id)
  await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() } as Record<string, unknown>)
}

export function subscribeAppeal(
  uid: string,
  id: string,
  cb: (a: Appeal | null, hasPendingWrites: boolean) => void,
) {
  const ref = doc(getDb(), 'appeals', uid, 'properties', id)
  return onSnapshot(ref, { includeMetadataChanges: true }, (snap) => {
    cb(
      snap.exists() ? ({ id: snap.id, ...snap.data() } as Appeal) : null,
      snap.metadata.hasPendingWrites,
    )
  })
}
