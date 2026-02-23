"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

function VerifyEmailPendingContent() {
  const [email, setEmail] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const hasCheckedRef = useRef(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();

  // Get email from URL params on mount
  useEffect(() => {
    const emailParam = searchParams?.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  // Check verification status once on mount
  useEffect(() => {
    // Prevent multiple checks
    if (hasCheckedRef.current) return;

    const emailToCheck = searchParams?.get("email");
    if (!emailToCheck) {
      setIsCheckingStatus(false);
      return;
    }

    // Check if user has an active session and is verified
    if (sessionStatus === "authenticated" && session?.user?.emailVerified) {
      hasCheckedRef.current = true;
      router.replace("/home");
      return;
    }

    // Wait for session to load before checking
    if (sessionStatus === "loading") {
      return;
    }

    const checkVerificationStatus = async () => {
      hasCheckedRef.current = true;

      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/api/v1/auth/check-verification?email=${encodeURIComponent(emailToCheck)}`);

        if (response.ok) {
          const data = await response.json();
          if (data.email_verified) {
            // User is already verified, redirect to login with success message
            router.replace("/user/login?verified=true");
            return;
          }
        }
      } catch (err) {
        console.error("Error checking verification status:", err);
      }

      setIsCheckingStatus(false);
    };

    checkVerificationStatus();
  }, [searchParams, router, session, sessionStatus]);

  const handleResendVerification = async () => {
    if (!email) return;

    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);
    setDevVerificationUrl(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/v1/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.already_verified) {
        // User is already verified, redirect to login
        router.push("/user/login?verified=true");
        return;
      }

      // In development mode, show the verification URL
      if (data.verification_url) {
        setDevVerificationUrl(data.verification_url);
      }

      setResendSuccess(true);
    } catch (err) {
      setResendError("Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Typequest Level Up Key Logo Component
  const TypequestLogo = ({ size = 48, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className}>
      <rect x="10" y="20" width="100" height="90" rx="12" fill="#2d2d2d" stroke="#1a1a1a" strokeWidth="3" />
      <defs>
        <linearGradient id="keyGradVerify" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a4a4a" />
          <stop offset="100%" stopColor="#2d2d2d" />
        </linearGradient>
      </defs>
      <rect x="18" y="24" width="84" height="74" rx="8" fill="url(#keyGradVerify)" />
      <path d="M60 40 L75 60 L67 60 L67 80 L53 80 L53 60 L45 60 Z" fill="#ff6b6b" />
    </svg>
  );

  // Show loading state while checking verification status
  if (isCheckingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#fafafa] font-[family-name:var(--font-space-grotesk)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#ff6b6b' }} />
          <p className="text-sm" style={{ color: '#666666' }}>Checking verification status...</p>
        </div>
      </div>
    );
  }

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

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#fff5f5' }}
            >
              <Mail className="h-10 w-10" style={{ color: '#ff6b6b' }} />
            </motion.div>

            <CardTitle
              className="text-2xl font-semibold"
              style={{ fontFamily: 'Fraunces, Georgia, serif', color: '#2d2d2d' }}
            >
              Check your email
            </CardTitle>
            <CardDescription className="text-base" style={{ color: '#666666' }}>
              We&apos;ve sent a verification link to
              {email && (
                <span className="block font-semibold mt-1" style={{ color: '#2d2d2d' }}>
                  {email}
                </span>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
                <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#4ecdc4' }} />
                <p className="text-sm" style={{ color: '#666666' }}>
                  Click the link in the email to verify your account
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#f8f8f8' }}>
                <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#4ecdc4' }} />
                <p className="text-sm" style={{ color: '#666666' }}>
                  The link expires in 24 hours
                </p>
              </div>
            </div>

            {/* Development mode: Show verification URL */}
            {devVerificationUrl && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg border-2 border-dashed"
                style={{ backgroundColor: '#fffbeb', borderColor: '#fbbf24' }}
              >
                <p className="text-sm font-semibold mb-2" style={{ color: '#92400e' }}>
                  Development Mode
                </p>
                <p className="text-xs mb-3" style={{ color: '#a16207' }}>
                  In production, this link would be sent via email.
                </p>
                <Link
                  href={devVerificationUrl}
                  className="text-sm font-medium underline break-all"
                  style={{ color: '#ff6b6b' }}
                >
                  Click here to verify your email
                </Link>
              </motion.div>
            )}

            {resendSuccess && !devVerificationUrl && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg"
                style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
              >
                <p className="text-sm" style={{ color: '#166534' }}>
                  Verification email sent! Please check your inbox.
                </p>
              </motion.div>
            )}

            {resendError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg"
                style={{ backgroundColor: '#fff5f5', border: '1px solid #ffcccc' }}
              >
                <p className="text-sm" style={{ color: '#cc0000' }}>{resendError}</p>
              </motion.div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleResendVerification}
                className="w-full h-12 font-semibold transition-all duration-200"
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid #e0e0e0',
                  color: '#666666',
                  borderRadius: '50px',
                }}
                disabled={isResending || !email}
              >
                {isResending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend verification email
                  </>
                )}
              </Button>

              <Link href="/user/login">
                <Button
                  className="w-full h-12 text-white font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: '#ff6b6b',
                    borderRadius: '50px',
                  }}
                >
                  Back to sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <p className="text-center text-sm" style={{ color: '#888888' }}>
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                onClick={handleResendVerification}
                className="font-semibold transition-colors hover:underline"
                style={{ color: '#ff6b6b' }}
                disabled={isResending}
              >
                resend it
              </button>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs mt-6" style={{ color: '#888888' }}>
          Need help?{" "}
          <Link href="/support" className="underline hover:no-underline">
            Contact support
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function VerifyEmailPending() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#fafafa]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#ff6b6b' }} />
      </div>
    }>
      <VerifyEmailPendingContent />
    </Suspense>
  );
}
