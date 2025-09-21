import { SignupForm } from "@/components/signup-form"
import { Particles } from "@/components/ui/particles"

export default function SignupPage() {
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
        <SignupForm />
      </div>
    </div>
  )
}