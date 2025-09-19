import { SignupForm } from "@/components/signup-form"
import { Particles } from "@/components/ui/particles"

export default function SignupPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 relative">
      <Particles
        className="absolute inset-0 z-0"
        quantity={100}
        ease={80}
        color="#64748b"
        refresh={false}
      />
      <div className="w-full max-w-sm md:max-w-3xl relative z-10">
        <SignupForm />
      </div>
    </div>
  )
}