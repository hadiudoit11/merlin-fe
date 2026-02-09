"use client";
import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

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

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const response = await fetch(`${backendUrl}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Verification failed");
        }

        setStatus("success");
      } catch (err) {
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#fafafa] font-[family-name:var(--font-space-grotesk)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl bg-white text-gray-900" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <CardHeader className="space-y-1 pb-6 text-center">
            <div className="flex justify-center mb-4">
              <TypequestLogo size={64} />
            </div>
            <CardTitle
              className="text-2xl font-semibold"
              style={{ fontFamily: 'Fraunces, Georgia, serif', color: '#2d2d2d' }}
            >
              {status === "loading" && "Verifying your email..."}
              {status === "success" && "Email verified!"}
              {status === "error" && "Verification failed"}
            </CardTitle>
            <CardDescription style={{ color: '#888888' }}>
              {status === "loading" && "Please wait while we verify your email address."}
              {status === "success" && "Your email has been successfully verified."}
              {status === "error" && "We couldn't verify your email. The link may have expired."}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex justify-center py-8">
            {status === "loading" && (
              <Loader2 className="h-16 w-16 animate-spin" style={{ color: '#ff6b6b' }} />
            )}
            {status === "success" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <CheckCircle2 className="h-16 w-16" style={{ color: '#4ecdc4' }} />
              </motion.div>
            )}
            {status === "error" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <XCircle className="h-16 w-16" style={{ color: '#ff6b6b' }} />
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-4">
            {status === "success" && (
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full">
                <Button
                  asChild
                  className="w-full h-12 text-white font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: '#ff6b6b',
                    borderRadius: '50px',
                  }}
                >
                  <Link href="/user/login">
                    Sign in to your account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            )}
            {status === "error" && (
              <>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full">
                  <Button
                    asChild
                    className="w-full h-12 text-white font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: '#ff6b6b',
                      borderRadius: '50px',
                    }}
                  >
                    <Link href="/user/register">
                      Request new verification link
                    </Link>
                  </Button>
                </motion.div>
                <p className="text-center text-sm" style={{ color: '#888888' }}>
                  Already verified?{" "}
                  <Link
                    href="/user/login"
                    className="font-semibold transition-colors"
                    style={{ color: '#ff6b6b' }}
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#fafafa]">
        <Loader2 className="h-16 w-16 animate-spin" style={{ color: '#ff6b6b' }} />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
