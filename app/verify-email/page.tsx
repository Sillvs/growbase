"use client"

import { Particles } from "@/components/ui/particles"
import { EmailVerification } from "@/components/email-verification"
import { useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { supabase } from "@/lib/supabase"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [isResending, setIsResending] = useState(false)

  const handleResendEmail = async () => {
    if (!email) return

    try {
      setIsResending(true)
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        console.error('Error resending email:', error)
      } else {
        // Show success message or toast
        console.log('Email resent successfully')
      }
    } catch (error) {
      console.error('Error resending email:', error)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="bg-muted relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <Particles
        className="absolute inset-0"
        quantity={100}
        staticity={50}
        ease={50}
        color="#0061ff"
      />
      <div className="relative z-10 w-full max-w-sm md:max-w-3xl">
        <EmailVerification
          email={email}
          onResendEmail={isResending ? undefined : handleResendEmail}
        />
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="bg-muted relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <Particles
          className="absolute inset-0"
          quantity={100}
          staticity={50}
          ease={50}
          color="#0061ff"
        />
        <div className="relative z-10 w-full max-w-sm md:max-w-3xl">
          <div className="text-center">Lädt...</div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}