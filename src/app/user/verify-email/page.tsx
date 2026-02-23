"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

type VerificationStatus = "verifying" | "success" | "error" | "expired" | "already_verified";

function VerifyEmailContent() {
  const [status, setStatus] = useState<VerificationStatus>("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams?.get("token");
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token provided");
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setStatus("success");
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/user/login?verified=true");
        }, 3000);
      } else {
        const data = await response.json();
        if (data.detail?.includes("expired")) {
          setStatus("expired");
        } else if (data.detail?.includes("already")) {
          setStatus("already_verified");
        } else {
          setStatus("error");
          setErrorMessage(data.detail || "Verification failed");
        }
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("Failed to verify email. Please try again.");
    }
  };

  // Typequest Level Up Key Logo Component
  const TypequestLogo = ({ size = 48, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className}>
      <rect x="10" y="20" width="100" height="90" rx="12" fill="#2d2d2d" stroke="#1a1a1a" strokeWidth="3" />
      <defs>
        <linearGradient id="keyGradVerifyToken" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a4a4a" />
          <stop offset="100%" stopColor="#2d2d2d" />
        </linearGradient>
      </defs>
      <rect x="18" y="24" width="84" height="74" rx="8" fill="url(#keyGradVerifyToken)" />
      <path d="M60 40 L75 60 L67 60 L67 80 L53 80 L53 60 L45 60 Z" fill="#ff6b6b" />
    </svg>
  );

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#f8f8f8' }}
            >
              <Loader2 className="h-10 w-10" style={{ color: '#ff6b6b' }} />
            </motion.div>
            <CardTitle
              className="text-2xl font-semibold"
              style={{ fontFamily: 'Fraunces, Georgia, serif', color: '#2d2d2d' }}
            >
              Verifying your email...
            </CardTitle>
            <CardDescription className="text-base" style={{ color: '#666666' }}>
              Please wait while we verify your email address.
            </CardDescription>
          </>
        );

      case "success":
        return (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#f0fdf4' }}
            >
              <CheckCircle2 className="h-10 w-10" style={{ color: '#22c55e' }} />
            </motion.div>
            <CardTitle
              className="text-2xl font-semibold"
              style={{ fontFamily: 'Fraunces, Georgia, serif', color: '#2d2d2d' }}
            >
              Email verified!
            </CardTitle>
            <CardDescription className="text-base" style={{ color: '#666666' }}>
              Your email has been successfully verified. Redirecting you to sign in...
            </CardDescription>
          </>
        );

      case "already_verified":
        return (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#f0fdf4' }}
            >
              <CheckCircle2 className="h-10 w-10" style={{ color: '#22c55e' }} />
            </motion.div>
            <CardTitle
              className="text-2xl font-semibold"
              style={{ fontFamily: 'Fraunces, Georgia, serif', color: '#2d2d2d' }}
            >
              Already verified
            </CardTitle>
            <CardDescription className="text-base" style={{ color: '#666666' }}>
              Your email has already been verified. You can sign in to your account.
            </CardDescription>
          </>
        );

      case "expired":
        return (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#fef3c7' }}
            >
              <XCircle className="h-10 w-10" style={{ color: '#f59e0b' }} />
            </motion.div>
            <CardTitle
              className="text-2xl font-semibold"
              style={{ fontFamily: 'Fraunces, Georgia, serif', color: '#2d2d2d' }}
            >
              Link expired
            </CardTitle>
            <CardDescription className="text-base" style={{ color: '#666666' }}>
              This verification link has expired. Please request a new one.
            </CardDescription>
          </>
        );

      case "error":
      default:
        return (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#fff5f5' }}
            >
              <XCircle className="h-10 w-10" style={{ color: '#ef4444' }} />
            </motion.div>
            <CardTitle
              className="text-2xl font-semibold"
              style={{ fontFamily: 'Fraunces, Georgia, serif', color: '#2d2d2d' }}
            >
              Verification failed
            </CardTitle>
            <CardDescription className="text-base" style={{ color: '#666666' }}>
              {errorMessage || "We couldn't verify your email. Please try again."}
            </CardDescription>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#fafafa] font-[family-name:var(--font-space-grotesk)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl bg-white text-gray-900" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <CardHeader className="space-y-4 pb-6 text-center">
            <div className="flex justify-center">
              <TypequestLogo size={64} />
            </div>
            {renderContent()}
          </CardHeader>

          <CardContent className="space-y-4">
            {status === "success" && (
              <div className="flex items-center justify-center gap-2 text-sm" style={{ color: '#666666' }}>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting to sign in...
              </div>
            )}

            {(status === "error" || status === "expired") && (
              <div className="space-y-3">
                <Link href="/user/verify-email-pending">
                  <Button
                    className="w-full h-12 text-white font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: '#ff6b6b',
                      borderRadius: '50px',
                    }}
                  >
                    Request new verification link
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}

            {(status === "already_verified" || status === "success") && (
              <Link href="/user/login?verified=true">
                <Button
                  className="w-full h-12 text-white font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: '#ff6b6b',
                    borderRadius: '50px',
                  }}
                >
                  Sign in to your account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#fafafa]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#ff6b6b' }} />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
