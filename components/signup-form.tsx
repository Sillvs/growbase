"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GrowbaseLogo } from "@/components/growbase-logo"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true)

      // Store the name in localStorage to use after OAuth redirect
      if (name.trim()) {
        localStorage.setItem('growbase_signup_name', name.trim())
      }

      await signInWithGoogle()
    } catch (error) {
      console.error('Error signing up:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <GrowbaseLogo className="mb-4 h-12 w-12 text-black" />
                <h1 className="text-2xl font-bold">Konto erstellen</h1>
                <p className="text-muted-foreground text-balance">
                  Erstellen Sie Ihr Growbase-Konto
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Max Mustermann"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <Button
                onClick={handleGoogleSignUp}
                disabled={loading || !name.trim()}
                className="w-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                {loading ? "Registrieren..." : "Mit Google registrieren"}
              </Button>

              <div className="text-center text-sm">
                Bereits ein Konto?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Anmelden
                </a>
              </div>
            </div>
          </div>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="https://images.pexels.com/photos/355288/pexels-photo-355288.jpeg"
              alt="Registrierung Bild"
              fill
              className="object-cover dark:brightness-[0.2] dark:grayscale"
              priority
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Durch Klicken auf Fortfahren stimmen Sie unseren <a href="https://getgrowbase.com">Nutzungsbedingungen</a>{" "}
        und unserer <a href="https://getgrowbase.com">Datenschutzerklärung</a> zu.
      </div>
    </div>
  )
}