"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { initializePaddle, Paddle } from "@paddle/paddle-js";

const paddleEnv =
  (process.env.NEXT_PUBLIC_PADDLE_ENV as "sandbox" | "production" | undefined) ??
  "sandbox";
const paddleToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
const paddlePriceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID;

export default function CheckoutButton() {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const missingEnvMessage = useMemo(() => {
    if (!paddleToken || !paddlePriceId) {
      return "Missing Paddle environment variables. Please set NEXT_PUBLIC_PADDLE_CLIENT_TOKEN and NEXT_PUBLIC_PADDLE_PRICE_ID.";
    }
    return null;
  }, []);

  useEffect(() => {
    if (missingEnvMessage) {
      setStatus("error");
      setErrorMessage(missingEnvMessage);
      return;
    }

    let mounted = true;
    setStatus("loading");

    initializePaddle({
      token: paddleToken!,
      environment: paddleEnv,
    })
      .then((instance) => {
        if (!mounted) return;

        if (!instance) {
          setStatus("error");
          setErrorMessage("Unable to initialize Paddle.");
          return;
        }

        setPaddle(instance);
        setStatus("ready");
      })
      .catch((err) => {
        if (!mounted) return;
        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to initialize Paddle.",
        );
      });

    return () => {
      mounted = false;
    };
  }, [missingEnvMessage]);

  const handleCheckout = useCallback(() => {
    if (!paddle || !paddlePriceId) {
      setErrorMessage("Paddle is not ready yet.");
      return;
    }

    paddle.Checkout.open({
      items: [
        {
          priceId: paddlePriceId,
          quantity: 1,
        },
      ],
      settings: {
        displayMode: "overlay",
        locale: "en",
        theme: "light",
        successUrl:
          process.env.NEXT_PUBLIC_SITE_URL ??
          "http://localhost:3000/christmas-wallpaper",
      },
    });
  }, [paddle]);

  const buttonLabel =
    status === "loading"
      ? "Connecting to Paddle..."
      : status === "ready"
        ? "Test Paddle Checkout"
        : "Paddle unavailable";

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={status !== "ready"}
        className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
      >
        {buttonLabel}
      </button>
      {status !== "ready" && (
        <p className="text-sm text-neutral-500">
          {errorMessage ?? "The sandbox test button will enable once Paddle finishes loading."}
        </p>
      )}
    </div>
  );
}
