"use client";
import React, { useState, useEffect } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, Shield, Sparkles, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuth0Loading, setIsAuth0Loading] = useState(false);
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
        setError("Invalid email or password. Please try again.");
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

  const features = [
    { icon: Target, text: "Visual OKR tracking" },
    { icon: Zap, text: "Real-time collaboration" },
    { icon: Sparkles, text: "AI-powered insights" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Modern gradient with glassmorphism */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-12 flex-col justify-between relative overflow-hidden"
      >
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-3xl"
          />
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="text-2xl font-black text-white tracking-tight">T</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Typequest</span>
          </motion.div>
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              Your goals,
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                visualized.
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/60 max-w-md leading-relaxed"
          >
            The infinite canvas for product teams. Map OKRs, track metrics,
            and collaborate in real-time.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-3"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <feature.icon className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-white/80">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-4 pt-4"
          >
            <div className="flex -space-x-3">
              {[
                "bg-gradient-to-br from-purple-400 to-pink-400",
                "bg-gradient-to-br from-blue-400 to-cyan-400",
                "bg-gradient-to-br from-amber-400 to-orange-400",
                "bg-gradient-to-br from-emerald-400 to-teal-400",
              ].map((gradient, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  className={`w-10 h-10 rounded-full ${gradient} border-2 border-slate-900 shadow-lg`}
                />
              ))}
            </div>
            <p className="text-white/50 text-sm">
              Join <span className="text-white font-semibold">2,500+</span> product teams
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="relative z-10 text-white/30 text-sm"
        >
          © 2025 Typequest. All rights reserved.
        </motion.div>
      </motion.div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl shadow-purple-500/5">
            <CardHeader className="space-y-1 pb-6">
              <div className="lg:hidden flex items-center gap-2 mb-4">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <span className="text-lg font-black text-white">T</span>
                </div>
                <span className="text-xl font-bold tracking-tight">Typequest</span>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to continue to your workspace
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Auth0 Button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 gap-3 border-2 hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-950/20 dark:hover:border-purple-800 transition-all duration-200"
                  onClick={handleAuth0Login}
                  disabled={isAuth0Loading}
                >
                  {isAuth0Loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Shield className="h-5 w-5 text-purple-600" />
                  )}
                  <span className="font-medium">
                    {isAuth0Loading ? "Connecting..." : "Continue with SSO"}
                  </span>
                </Button>
              </motion.div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">
                    or
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-2 focus:border-purple-500 focus:ring-purple-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Link
                      href="/user/forgot-password"
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12 border-2 focus:border-purple-500 focus:ring-purple-500/20"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                  >
                    <p className="text-sm text-destructive">{error}</p>
                  </motion.div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="border-2 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal text-muted-foreground cursor-pointer"
                  >
                    Keep me signed in
                  </Label>
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25 transition-all duration-200"
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
              <p className="text-center text-sm text-muted-foreground">
                New to Typequest?{" "}
                <Link
                  href="/user/register"
                  className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </CardFooter>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
