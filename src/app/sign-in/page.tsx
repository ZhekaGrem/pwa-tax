'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SignInPage() {
  const { user, signInWithGoogle } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (user) router.replace('/dashboard')
  }, [user, router])
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in to Protest Pilot</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => signInWithGoogle()} className="w-full">
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
