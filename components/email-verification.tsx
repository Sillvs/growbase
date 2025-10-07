"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GrowbaseLogo } from "@/components/growbase-logo"
import { ExternalLink } from "lucide-react"
import Image from "next/image"

interface EmailVerificationProps {
  email: string
  onResendEmail?: () => void
  className?: string
}

export function EmailVerification({
  email,
  onResendEmail,
  className,
  ...props
}: EmailVerificationProps & React.ComponentProps<"div">) {
  const openGmail = () => {
    window.open('https://mail.google.com', '_blank')
  }

  const openOutlook = () => {
    window.open('https://outlook.live.com', '_blank')
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <GrowbaseLogo className="mb-4 h-12 w-12 text-black" />
                <h1 className="text-2xl font-bold">E-Mail-Bestätigung erforderlich</h1>
                <p className="text-muted-foreground text-balance">
                  Wir haben eine Bestätigungs-E-Mail an <strong>{email}</strong> gesendet.
                </p>
              </div>

              <div className="grid gap-3">
                <p className="text-sm font-medium">E-Mail-Postfach öffnen:</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    onClick={openGmail}
                    className="w-full"
                  >
                    Gmail öffnen
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openOutlook}
                    className="w-full"
                  >
                    Outlook öffnen
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </div>

              {onResendEmail && (
                <div className="border-t pt-4 text-center">
                  <p className="text-muted-foreground text-sm mb-3">
                    Keine E-Mail erhalten?
                  </p>
                  <Button
                    variant="ghost"
                    onClick={onResendEmail}
                    className="text-sm"
                  >
                    E-Mail erneut senden
                  </Button>
                </div>
              )}

              <div className="text-center text-sm">
                <a href="/login" className="text-primary hover:underline">
                  Zurück zur Anmeldung
                </a>
              </div>
            </div>
          </div>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="https://images.pexels.com/photos/355288/pexels-photo-355288.jpeg"
              alt="E-Mail Verifizierung"
              fill
              className="object-cover dark:brightness-[0.2] dark:grayscale"
              priority
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Bei Problemen kontaktieren Sie uns über{" "}
        <a href="https://getgrowbase.com">getgrowbase.com</a>
      </div>
    </div>
  )
}