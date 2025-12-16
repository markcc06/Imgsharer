import CheckoutButton from "@/components/CheckoutButton";
import { Metadata } from "next";
import { notFound } from "next/navigation";

const isEnabled =
  process.env.NEXT_PUBLIC_ENABLE_PADDLE_TEST === "1" ||
  process.env.NEXT_PUBLIC_ENABLE_PADDLE_TEST === "true";

export const metadata: Metadata = {
  title: "Paddle Checkout Test | Imgsharer",
  robots: { index: false },
};

export default function PaddleTestPage() {
  if (!isEnabled) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Sandbox Only
      </span>
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
        Paddle Checkout Sandbox
      </h1>
      <p className="max-w-2xl text-base text-neutral-600">
        This hidden route exists only for verifying Paddle&apos;s overlay
        checkout in sandbox mode. Keep it disabled (via
        NEXT_PUBLIC_ENABLE_PADDLE_TEST) in production to avoid exposing the
        button to end users.
      </p>
      <CheckoutButton />
      <p className="text-xs text-neutral-400">
        Successful payment will redirect to{" "}
        {process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"} once the
        sandbox checkout completes.
      </p>
    </main>
  );
}
