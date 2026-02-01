import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <SignIn appearance={{ elements: { card: "shadow-lg" } }} />
    </div>
  )
}
