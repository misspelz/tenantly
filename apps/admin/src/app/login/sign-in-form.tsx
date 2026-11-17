"use client";

import { SignInSchema } from "@tenantly/contracts";
import { useRouter } from "next/navigation";
import { useState, type SyntheticEvent } from "react";

import { apiBaseUrl } from "../../lib/api";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const input = SignInSchema.safeParse({ email, password });

    if (!input.success) {
      setError("Enter a valid email address and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input.data),
      });

      if (!response.ok) {
        setError(
          response.status === 401
            ? "Email or password is incorrect."
            : "Sign-in failed. Please try again.",
        );
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Could not reach the API. Check that the API is running and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
    >
      <div>
        <label htmlFor="email">Email</label>
        <input
          autoComplete="email"
          id="email"
          name="email"
          onChange={(event) => {
            setEmail(event.target.value);
          }}
          required
          type="email"
          value={email}
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          autoComplete="current-password"
          id="password"
          name="password"
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          required
          type="password"
          value={password}
        />
      </div>
      {error ? <p role="alert">{error}</p> : null}
      <button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
