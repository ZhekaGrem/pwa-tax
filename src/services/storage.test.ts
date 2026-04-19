import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest'
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing'
import { readFileSync } from 'node:fs'
import { doc, setDoc, getDoc } from 'firebase/firestore'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-ptx',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  })
})

afterAll(async () => {
  await env.cleanup()
})

beforeEach(async () => {
  await env.clearFirestore()
})

describe('firestore rules', () => {
  it('allows owner to write their appeal', async () => {
    const alice = env.authenticatedContext('alice').firestore()
    const ref = doc(alice, 'appeals/alice/properties/p1')
    await assertSucceeds(setDoc(ref, { ownerUid: 'alice', status: 'draft', year: 2026 }))
  })

  it('blocks bob from writing alice document', async () => {
    const bob = env.authenticatedContext('bob').firestore()
    const ref = doc(bob, 'appeals/alice/properties/p1')
    await assertFails(setDoc(ref, { ownerUid: 'bob', status: 'draft', year: 2026 }))
  })

  it('blocks anonymous reads', async () => {
    const unauth = env.unauthenticatedContext().firestore()
    const ref = doc(unauth, 'appeals/alice/properties/p1')
    await assertFails(getDoc(ref))
  })

  it('blocks writes with mismatched ownerUid', async () => {
    const alice = env.authenticatedContext('alice').firestore()
    const ref = doc(alice, 'appeals/alice/properties/p1')
    await assertFails(setDoc(ref, { ownerUid: 'bob', status: 'draft', year: 2026 }))
  })
})
