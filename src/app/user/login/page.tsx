"use client";
import React, { useState, useEffect } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuth0Loading, setIsAuth0Loading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

  const handleAuth0Login = async () => {
    setError(null);
    setIsAuth0Loading(true);
    try {
      await signIn("auth0", { callbackUrl: "/home" });
    } catch (err) {
      setError("Failed to sign in with Auth0. Please try again.");
      setIsAuth0Loading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await signIn("auth0", {
        callbackUrl: "/home",
        connection: "google-oauth2"
      });
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
      setIsGoogleLoading(false);
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
          <Card className="border-0 shadow-xl" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
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
                  style={{
                    borderColor: '#e0e0e0',
                  }}
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  <span className="font-medium">
                    {isGoogleLoading ? "Connecting..." : "Continue with Google"}
                  </span>
                </Button>
              </motion.div>

              {/* SSO Button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 gap-3 border-2 transition-all duration-200"
                  style={{
                    borderColor: '#e0e0e0',
                  }}
                  onClick={handleAuth0Login}
                  disabled={isAuth0Loading}
                >
                  {isAuth0Loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Shield className="h-5 w-5" style={{ color: '#4ecdc4' }} />
                  )}
                  <span className="font-medium">
                    {isAuth0Loading ? "Connecting..." : "Continue with SSO"}
                  </span>
                </Button>
              </motion.div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: '#e0e0e0' }} />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3" style={{ color: '#888888' }}>
                    or
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#2d2d2d' }}>
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none z-10" style={{ color: '#888888' }} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
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
