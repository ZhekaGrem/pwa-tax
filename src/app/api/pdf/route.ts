import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { fillForm50132 } from '@/lib/pdf'
import { AppealSchema } from '@/schemas/appeal'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token)
    return NextResponse.json({ error: 'Missing token', code: 'UNAUTHENTICATED' }, { status: 401 })

  let uid: string
  try {
    uid = (await adminAuth().verifyIdToken(token)).uid
  } catch {
    return NextResponse.json({ error: 'Invalid token', code: 'UNAUTHENTICATED' }, { status: 401 })
  }

  const { appealId, signatureName } = (await req.json()) as {
    appealId?: string
    signatureName?: string
  }
  if (!appealId)
    return NextResponse.json({ error: 'appealId required', code: 'VALIDATION' }, { status: 422 })

  const snap = await adminDb().doc(`appeals/${uid}/properties/${appealId}`).get()
  if (!snap.exists)
    return NextResponse.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 })
  const raw = { id: snap.id, ...snap.data() }
  const parsed = AppealSchema.safeParse(raw)
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Invalid appeal data', code: 'VALIDATION', issues: parsed.error.issues },
      { status: 422 },
    )
  if (parsed.data.ownerUid !== uid)
    return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 })

  try {
    const bytes = await fillForm50132(parsed.data, signatureName ?? 'Property Owner')
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="appeal-${parsed.data.year}.pdf"`,
        'cache-control': 'no-store',
      },
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message, code: 'PDF_GEN_FAIL' }, { status: 500 })
  }
}
