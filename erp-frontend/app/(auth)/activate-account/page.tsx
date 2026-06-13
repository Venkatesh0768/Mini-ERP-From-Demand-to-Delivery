"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, KeyRound, XCircle } from "lucide-react";
import { isAxiosError } from "axios";
import { authApi } from "@/lib/api/auth.api";
import { AuthCard, AuthHeader } from "@/components/layout/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

function ActivateAccountContent() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const token       = searchParams.get("token") ?? "";

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [errors, setErrors]       = useState<{ password?: string; confirm?: string }>({});
  const [apiError, setApiError]   = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);
  const [loading, setLoading]     = useState(false);

  // If no token in URL, show error immediately
  const missingToken = !token;

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!password)                e.password = "Password is required";
    else if (password.length < 8) e.password = "At least 8 characters";
    if (!confirm)                 e.confirm  = "Please confirm your password";
    else if (confirm !== password) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError(null);
    setLoading(true);
    try {
      await authApi.activateAccount({ token, password });
      setSuccess(true);
    } catch (err) {
      if (isAxiosError(err)) {
        setApiError(
          err.response?.data?.message ??
          "Activation failed. Your link may have expired — contact an admin."
        );
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Success state ────────────────────────────────────────────────────────
  if (success) {
    return (
      <AuthCard>
        <div className="flex flex-col items-center gap-5 py-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
            <CheckCircle2 size={28} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1b1c1c] font-sans mb-2">
              Account activated!
            </h2>
            <p className="text-sm text-[#444748] font-sans leading-relaxed">
              Your password has been set and your account is ready. You can now sign in.
            </p>
          </div>
          <Button fullWidth size="lg" onClick={() => router.push("/login")}>
            Go to sign in
          </Button>
        </div>
      </AuthCard>
    );
  }

  // ─── Missing token state ──────────────────────────────────────────────────
  if (missingToken) {
    return (
      <AuthCard>
        <div className="flex flex-col items-center gap-5 py-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-200">
            <XCircle size={28} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1b1c1c] font-sans mb-2">
              Invalid activation link
            </h2>
            <p className="text-sm text-[#444748] font-sans leading-relaxed">
              This link is missing the activation token. Please use the full link from your invitation email.
            </p>
          </div>
          <Link
            href="/login"
            className="text-sm text-[#747878] hover:text-[#1b1c1c] font-sans transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    );
  }

  // ─── Main form ────────────────────────────────────────────────────────────
  return (
    <AuthCard>
      <div className="flex justify-center mb-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(42,103,107,0.1)] border border-[rgba(42,103,107,0.2)]">
          <KeyRound size={20} className="text-[#2a676b]" />
        </div>
      </div>

      <AuthHeader
        title="Set your password"
        subtitle="Choose a strong password to activate your account"
      />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Alert variant="error" message={apiError} />

        <Input
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((er) => ({ ...er, password: undefined }));
          }}
          error={errors.password}
          disabled={loading}
          autoFocus
        />

        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            setErrors((er) => ({ ...er, confirm: undefined }));
          }}
          error={errors.confirm}
          disabled={loading}
        />

        {/* Password strength hints */}
        <ul className="text-xs text-[#747878] space-y-1 font-sans">
          <li className={password.length >= 8 ? "text-emerald-600" : ""}>
            {password.length >= 8 ? "✓" : "○"} At least 8 characters
          </li>
          <li className={/[A-Z]/.test(password) ? "text-emerald-600" : ""}>
            {/[A-Z]/.test(password) ? "✓" : "○"} One uppercase letter
          </li>
          <li className={/[0-9]/.test(password) ? "text-emerald-600" : ""}>
            {/[0-9]/.test(password) ? "✓" : "○"} One number
          </li>
        </ul>

        <Button type="submit" loading={loading} fullWidth size="lg">
          {loading ? "Activating…" : "Activate account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-[#747878] font-sans">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#1b1c1c] font-semibold hover:text-[#2a676b] transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}

export default function ActivateAccountPage() {
  return (
    <Suspense
      fallback={
        <AuthCard>
          <div className="flex justify-center items-center h-48">
            <div className="h-6 w-6 rounded-full border-2 border-[#2a676b] border-t-transparent animate-spin" />
          </div>
        </AuthCard>
      }
    >
      <ActivateAccountContent />
    </Suspense>
  );
}
