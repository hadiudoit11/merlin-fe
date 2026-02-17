"use client";
import React, { useState, useEffect } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, Shield, Eye, EyeOff, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDiscordLoading, setIsDiscordLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [isSSOLoading, setIsSSOLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        if (status === "authenticated" && session?.accessToken && !session?.error) {
          router.push("/home");
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
    };
    checkExistingSession();
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Oops! That didn't quite work. Let's try again.");
        setIsLoading(false);
        return;
      }

      setTimeout(async () => {
        const session = await getSession();
        if (!session || !session.accessToken) {
          setError("Failed to establish session. Please try again.");
          setIsLoading(false);
          return;
        }
        router.push("/home");
      }, 500);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/home" });
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  const handleDiscordLogin = async () => {
    setError(null);
    setIsDiscordLoading(true);
    try {
      await signIn("discord", { callbackUrl: "/home" });
    } catch (err) {
      setError("Failed to sign in with Discord. Please try again.");
      setIsDiscordLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setError(null);
    setIsGitHubLoading(true);
    try {
      await signIn("github", { callbackUrl: "/home" });
    } catch (err) {
      setError("Failed to sign in with GitHub. Please try again.");
      setIsGitHubLoading(false);
    }
  };

  const handleSSOLogin = async () => {
    setError(null);
    setIsSSOLoading(true);
    try {
      await signIn("auth0", { callbackUrl: "/home" });
    } catch (err) {
      setError("Failed to sign in with SSO. Please try again.");
      setIsSSOLoading(false);
    }
  };

  // Typequest Level Up Key Logo Component
  const TypequestLogo = ({ size = 48, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className}>
      <rect x="10" y="20" width="100" height="90" rx="12" fill="#2d2d2d" stroke="#1a1a1a" strokeWidth="3" />
      <defs>
        <linearGradient id="keyGradLogin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a4a4a" />
          <stop offset="100%" stopColor="#2d2d2d" />
        </linearGradient>
      </defs>
      <rect x="18" y="24" width="84" height="74" rx="8" fill="url(#keyGradLogin)" />
      <path d="M60 40 L75 60 L67 60 L67 80 L53 80 L53 60 L45 60 Z" fill="#ff6b6b" />
    </svg>
  );

  return (
    <div className="min-h-screen flex font-[family-name:var(--font-space-grotesk)]">
      {/* Left side - Charcoal background with branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden"
        style={{ backgroundColor: '#2d2d2d' }}
      >
        {/* Decorative gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: '#ff6b6b' }}
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: '#4ecdc4' }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <TypequestLogo size={48} />
            <span
              className="text-2xl font-semibold text-white"
              style={{ fontFamily: 'Fraunces, Georgia, serif' }}
            >
              Typequest
            </span>
          </motion.div>
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1
              className="text-4xl lg:text-5xl font-semibold text-white leading-tight"
              style={{ fontFamily: 'Fraunces, Georgia, serif' }}
            >
              Level up your
              <br />
              <span style={{ color: '#ff6b6b' }}>product workflow</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg max-w-md leading-relaxed"
            style={{ color: '#888888' }}
          >
            The infinite canvas for OKRs, metrics, and cross-functional collaboration.
            Built for modern product teams.
          </motion.p>

          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            {[
              { emoji: '🎯', text: 'Visual OKR tracking' },
              { emoji: '⚡', text: 'Real-time collaboration' },
              { emoji: '✨', text: 'AI-powered insights' },
            ].map((feature, i) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-xl">{feature.emoji}</span>
                <span style={{ color: '#aaaaaa' }}>{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-4 pt-4"
          >
            <div className="flex -space-x-3">
              {['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3'].map((color, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.05 }}
                  className="w-10 h-10 rounded-full border-2"
                  style={{ backgroundColor: color, borderColor: '#2d2d2d' }}
                />
              ))}
            </div>
            <p className="text-sm" style={{ color: '#888888' }}>
              Join <span className="font-semibold text-white">2,500+</span> product teams
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="relative z-10 text-sm"
          style={{ color: '#666666' }}
        >
          © 2025 Typequest. All rights reserved.
        </motion.div>
      </motion.div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#fafafa]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-xl bg-white text-gray-900" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardHeader className="space-y-1 pb-6">
              <div className="lg:hidden flex items-center gap-3 mb-4">
                <TypequestLogo size={36} />
                <span
                  className="text-xl font-semibold"
                  style={{ fontFamily: 'Fraunces, Georgia, serif', color: '#2d2d2d' }}
                >
                  Typequest
                </span>
              </div>
              <CardTitle
                className="text-2xl font-semibold"
                style={{ fontFamily: 'Fraunces, Georgia, serif', color: '#2d2d2d' }}
              >
                Welcome back
              </CardTitle>
              <CardDescription style={{ color: '#888888' }}>
                Sign in to continue to your workspace
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Google Button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 gap-3 border-2 transition-all duration-200"
                  style={{ borderColor: '#e0e0e0' }}
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  <span className="font-medium">
                    {isGoogleLoading ? "Connecting..." : "Continue with Google"}
                  </span>
                </Button>
              </motion.div>

              {/* Discord Button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 gap-3 border-2 transition-all duration-200"
                  style={{ borderColor: '#e0e0e0' }}
                  onClick={handleDiscordLogin}
                  disabled={isDiscordLoading}
                >
                  {isDiscordLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#5865F2">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  )}
                  <span className="font-medium">
                    {isDiscordLoading ? "Connecting..." : "Continue with Discord"}
                  </span>
                </Button>
              </motion.div>

              {/* GitHub Button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 gap-3 border-2 transition-all duration-200"
                  style={{ borderColor: '#e0e0e0' }}
                  onClick={handleGitHubLogin}
                  disabled={isGitHubLoading}
                >
                  {isGitHubLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#24292f">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  )}
                  <span className="font-medium">
                    {isGitHubLoading ? "Connecting..." : "Continue with GitHub"}
                  </span>
                </Button>
              </motion.div>

              {/* SSO Button for Enterprise */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 gap-3 border-2 transition-all duration-200"
                  style={{ borderColor: '#e0e0e0' }}
                  onClick={handleSSOLogin}
                  disabled={isSSOLoading}
                >
                  {isSSOLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Shield className="h-5 w-5" style={{ color: '#4ecdc4' }} />
                  )}
                  <span className="font-medium">
                    {isSSOLoading ? "Connecting..." : "Enterprise SSO"}
                  </span>
                </Button>
              </motion.div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: '#fff5f5', border: '1px solid #ffcccc' }}
                >
                  <p className="text-sm" style={{ color: '#cc0000' }}>{error}</p>
                </motion.div>
              )}

              {/* Collapsible Email/Password Form */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(!showEmailForm)}
                  className="w-full flex items-center justify-center gap-2 text-sm transition-colors py-2"
                  style={{ color: '#888888' }}
                >
                  <span>Sign in with email</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${showEmailForm ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {showEmailForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#2d2d2d' }}>
                            Email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none z-10" style={{ color: '#888888' }} />
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="!pl-12 pr-4 h-12 border-2"
                              style={{ borderColor: '#e0e0e0' }}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium" style={{ color: '#2d2d2d' }}>
                              Password
                            </Label>
                            <Link
                              href="/user/forgot-password"
                              className="text-sm font-medium transition-colors"
                              style={{ color: '#ff6b6b' }}
                            >
                              Forgot?
                            </Link>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none z-10" style={{ color: '#888888' }} />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="!pl-12 !pr-12 h-12 border-2"
                              style={{ borderColor: '#e0e0e0' }}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity z-10"
                              style={{ color: '#888888' }}
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="remember"
                            className="h-5 w-5 border-2 border-gray-300 data-[state=checked]:bg-[#ff6b6b] data-[state=checked]:border-[#ff6b6b] data-[state=checked]:text-white"
                          />
                          <Label
                            htmlFor="remember"
                            className="text-sm font-normal cursor-pointer"
                            style={{ color: '#666666' }}
                          >
                            Keep me signed in
                          </Label>
                        </div>

                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                          <Button
                            type="submit"
                            className="w-full h-12 text-white font-semibold transition-all duration-200"
                            style={{
                              backgroundColor: '#ff6b6b',
                              borderRadius: '50px',
                            }}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <>
                                Sign in
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-4">
              <p className="text-center text-sm" style={{ color: '#888888' }}>
                New to Typequest?{" "}
                <Link
                  href="/user/register"
                  className="font-semibold transition-colors"
                  style={{ color: '#ff6b6b' }}
                >
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </Card>

          <p className="text-center text-xs mt-6" style={{ color: '#888888' }}>
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline hover:no-underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:no-underline">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
