"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GrowbaseLogo } from "@/components/growbase-logo"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"

interface OnboardingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const countries = [
  { value: "de", label: "Deutschland" },
  { value: "at", label: "Österreich" },
  { value: "ch", label: "Schweiz" },
  { value: "fr", label: "Frankreich" },
  { value: "it", label: "Italien" },
  { value: "es", label: "Spanien" },
  { value: "nl", label: "Niederlande" },
  { value: "be", label: "Belgien" },
  { value: "pl", label: "Polen" },
  { value: "uk", label: "Vereinigtes Königreich" },
]

const languages = [
  { value: "de", label: "Deutsch" },
  { value: "en", label: "Englisch" },
  { value: "fr", label: "Französisch" },
  { value: "it", label: "Italienisch" },
  { value: "es", label: "Spanisch" },
  { value: "nl", label: "Niederländisch" },
]

export function OnboardingDialog({ open, onOpenChange }: OnboardingDialogProps) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    companyWebsite: "",
    targetMarket: "",
    targetLanguage: "",
  })

  const handleWebsiteChange = (value: string) => {
    let website = value
    if (website && !website.startsWith("https://")) {
      website = "https://" + website
    }
    setFormData({ ...formData, companyWebsite: website })
  }

  const handleSubmit = async () => {
    if (!user) {
      console.error("No user found")
      return
    }

    setLoading(true)
    try {
      // Create row in Supabase Company_DNA table with all form data
      const { supabase } = await import("@/lib/supabase")
      const { data: insertData, error: supabaseError } = await supabase
        .from('company_dna')
        .insert({
          user_id: user.id,
          company_name: formData.companyName,
          company_website: formData.companyWebsite,
          target_market: formData.targetMarket,
          target_language: formData.targetLanguage
        })
        .select()

      if (supabaseError) {
        console.error("Supabase error:", supabaseError)
      }

      // Send webhook data for workflow processing
      const webhookData = {
        userId: user.id,
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite,
        targetMarket: formData.targetMarket,
        targetLanguage: formData.targetLanguage,
      }

      console.log("Sending webhook data:", webhookData)

      const webhookResponse = await fetch("https://primary-production-423a.up.railway.app/webhook/10e45c62-e08a-4e9a-89c2-ffc4fa017e63", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookData),
      })

      console.log("Webhook response status:", webhookResponse.status)

      // Always go to step 4, even if there are errors
      setStep(4)
    } catch (error) {
      console.error("Error submitting onboarding data:", error)
      // Still go to step 4 even on error
      setStep(4)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 2:
        return formData.companyName.trim() !== "" && formData.companyWebsite.trim() !== ""
      case 3:
        return formData.targetMarket !== "" && formData.targetLanguage !== ""
      case 4:
        return true // Optional step
      default:
        return true
    }
  }

  return (
    <Dialog open={open} onOpenChange={step === 4 ? onOpenChange : () => {}}>
      <DialogContent className={`gap-0 p-0 ${step === 4 ? '' : '[&>button:last-child]:hidden'}`}>
        <div className="p-2">
          <Image
            src="/onboarding-bg.jpeg"
            alt="Onboarding"
            width={382}
            height={216}
            className="w-full rounded-lg object-cover"
            priority
          />
        </div>
        <div className="space-y-6 px-6 pb-6 pt-3">
          <DialogHeader className="text-left">
            <DialogTitle className="text-left">
              {step === 1 && "Willkommen bei Growbase"}
              {step === 2 && ""}
              {step === 3 && "Zielmarkt & Sprache"}
              {step === 4 && "Google Search Console verbinden"}
            </DialogTitle>
            {step === 1 && (
              <div className="text-left space-y-3 mt-4">
                <p className="text-sm text-muted-foreground">
                  Mit dem Tool ermöglichen Sie es Ihrem Unternehmen, endlich in Zeiten von KI gefunden zu werden und Ihre Nutzer von KI-Systemen auf Ihr Unternehmen aufmerksam zu machen.
                </p>
              </div>
            )}
          </DialogHeader>

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="companyName" className="block">Unternehmensname</Label>
                <Input
                  id="companyName"
                  placeholder="Ihr Unternehmensname"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="companyWebsite" className="block">Unternehmenswebsite</Label>
                <Input
                  id="companyWebsite"
                  placeholder="beispiel.de"
                  value={formData.companyWebsite}
                  onChange={(e) => handleWebsiteChange(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  https:// wird automatisch hinzugefügt
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="targetMarket" className="block">Zielmarkt</Label>
                <Select value={formData.targetMarket} onValueChange={(value) => setFormData({ ...formData, targetMarket: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Wählen Sie Ihren Zielmarkt" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="targetLanguage" className="block">Zielsprache</Label>
                <Select value={formData.targetLanguage} onValueChange={(value) => setFormData({ ...formData, targetLanguage: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Wählen Sie Ihre Zielsprache" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language.value} value={language.value}>
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-left">
              <p className="text-sm text-muted-foreground">
                Wir bereiten im Hintergrund alles für Sie vor. In der Zwischenzeit können Sie aber gerne schon mal Ihre Google Search Console verbinden.
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                Frei nach dem Motto: &quot;Man kann nicht verbessern, was man nicht messen kann.&quot;
              </p>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    window.location.href = '/api/gsc/auth'
                  }}
                >
                  Google Search Console verbinden
                </Button>
              </div>
            </div>
          )}

          {step !== 4 && (
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex justify-center space-x-1.5 max-sm:order-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${
                      i <= step ? "bg-primary" : "bg-primary/20"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                {step > 1 && (
                  <Button variant="ghost" onClick={() => setStep(step - 1)}>
                    Zurück
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                  >
                    Weiter
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceed() || loading}
                  >
                    {loading ? "Wird gespeichert..." : "Weiter"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}