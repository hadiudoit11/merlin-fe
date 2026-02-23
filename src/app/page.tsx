'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  Target,
  Zap,
  GitBranch,
  BarChart3,
  FileText,
  ArrowRight,
  Check,
  Loader2,
  Cpu
} from 'lucide-react';
import Link from 'next/link';

// ============================================
// PICASSO-INSPIRED ABSTRACT ART COMPONENTS
// ============================================

// Bold geometric abstract background - cubist inspired
function AbstractBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Large bold geometric shapes */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-[#ff6b6b]/30 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-tr from-[#4ecdc4]/25 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-gradient-to-bl from-[#ffe66d]/20 to-transparent rounded-full blur-3xl" />

      {/* Cubist geometric shapes */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        {/* Angular abstract shapes */}
        <polygon points="0,200 300,0 400,300 100,400" fill="#ff6b6b" />
        <polygon points="600,100 1000,0 1000,400 700,300" fill="#4ecdc4" />
        <polygon points="200,600 500,500 600,800 300,900" fill="#ffe66d" />
        <polygon points="700,500 1000,600 900,1000 600,800" fill="#ff6b6b" />
        <polygon points="0,700 200,500 400,700 200,1000 0,1000" fill="#4ecdc4" />

        {/* Bold lines */}
        <line x1="0" y1="300" x2="400" y2="100" stroke="#ff6b6b" strokeWidth="3" />
        <line x1="600" y1="200" x2="1000" y2="500" stroke="#4ecdc4" strokeWidth="3" />
        <line x1="100" y1="800" x2="500" y2="600" stroke="#ffe66d" strokeWidth="3" />
      </svg>

      {/* Floating abstract circles with bold strokes */}
      <div className="absolute top-[15%] left-[8%] w-24 h-24 rounded-full border-4 border-[#ff6b6b]/40 animate-float-slow" />
      <div className="absolute top-[25%] right-[12%] w-16 h-16 rounded-full border-4 border-[#4ecdc4]/40 animate-float-medium" />
      <div className="absolute bottom-[30%] left-[15%] w-20 h-20 rounded-full border-4 border-[#ffe66d]/40 animate-float-fast" />
      <div className="absolute bottom-[20%] right-[8%] w-32 h-32 rounded-full border-4 border-[#ff6b6b]/30 animate-float-slow" />

      {/* Floating squares - cubist touch */}
      <div className="absolute top-[45%] left-[5%] w-12 h-12 border-4 border-[#4ecdc4]/30 rotate-45 animate-spin-slow" />
      <div className="absolute top-[60%] right-[10%] w-16 h-16 border-4 border-[#ff6b6b]/25 rotate-12 animate-spin-reverse" />
      <div className="absolute top-[10%] left-[40%] w-10 h-10 bg-[#ffe66d]/20 rotate-45 animate-float-medium" />

      {/* Bold intersecting lines */}
      <div className="absolute top-0 left-[30%] w-1 h-full bg-gradient-to-b from-transparent via-[#ff6b6b]/10 to-transparent" />
      <div className="absolute top-0 left-[70%] w-1 h-full bg-gradient-to-b from-transparent via-[#4ecdc4]/10 to-transparent" />
      <div className="absolute top-[40%] left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ffe66d]/10 to-transparent" />
    </div>
  );
}

// Picasso-style hero art - abstract face/composition
function HeroArt() {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-80 hidden lg:block">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <defs>
          <linearGradient id="picassoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="100%" stopColor="#4ecdc4" />
          </linearGradient>
          <linearGradient id="picassoGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ecdc4" />
            <stop offset="100%" stopColor="#ffe66d" />
          </linearGradient>
        </defs>

        {/* Abstract cubist composition */}
        <path d="M100,50 L200,30 L250,100 L200,180 L100,150 Z" fill="#ff6b6b" opacity="0.7">
          <animate attributeName="d" dur="8s" repeatCount="indefinite"
            values="M100,50 L200,30 L250,100 L200,180 L100,150 Z;
                    M110,60 L210,40 L240,110 L190,170 L90,140 Z;
                    M100,50 L200,30 L250,100 L200,180 L100,150 Z" />
        </path>

        <path d="M150,120 L280,80 L320,200 L250,280 L120,240 Z" fill="#4ecdc4" opacity="0.6">
          <animate attributeName="d" dur="10s" repeatCount="indefinite"
            values="M150,120 L280,80 L320,200 L250,280 L120,240 Z;
                    M160,130 L270,90 L310,190 L240,270 L130,230 Z;
                    M150,120 L280,80 L320,200 L250,280 L120,240 Z" />
        </path>

        <path d="M80,200 L180,180 L220,300 L140,360 L60,300 Z" fill="#ffe66d" opacity="0.5">
          <animate attributeName="d" dur="12s" repeatCount="indefinite"
            values="M80,200 L180,180 L220,300 L140,360 L60,300 Z;
                    M90,210 L190,190 L210,310 L130,350 L70,290 Z;
                    M80,200 L180,180 L220,300 L140,360 L60,300 Z" />
        </path>

        {/* Bold strokes */}
        <line x1="50" y1="100" x2="350" y2="150" stroke="url(#picassoGrad1)" strokeWidth="4" strokeLinecap="round">
          <animate attributeName="y2" dur="6s" repeatCount="indefinite" values="150;170;150" />
        </line>
        <line x1="100" y1="250" x2="350" y2="300" stroke="url(#picassoGrad2)" strokeWidth="4" strokeLinecap="round">
          <animate attributeName="y1" dur="7s" repeatCount="indefinite" values="250;230;250" />
        </line>

        {/* Geometric accents */}
        <circle cx="280" cy="120" r="20" fill="none" stroke="#ff6b6b" strokeWidth="3" />
        <circle cx="120" cy="200" r="15" fill="none" stroke="#4ecdc4" strokeWidth="3" />
        <rect x="60" y="280" width="30" height="30" fill="none" stroke="#4ecdc4" strokeWidth="3" transform="rotate(15 75 295)" />
        <rect x="280" cy="250" width="25" height="25" fill="none" stroke="#ffe66d" strokeWidth="3" transform="rotate(45 292 262)" />
        <polygon points="300,280 330,320 270,320" fill="none" stroke="#ffe66d" strokeWidth="3" />
        <polygon points="80,120 110,80 140,120 110,140" fill="none" stroke="#ff6b6b" strokeWidth="3" />
      </svg>
    </div>
  );
}

// Bold animated connection diagram - abstract style
function AbstractConnectionDiagram() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto" style={{ height: '500px' }}>
      {/* Abstract background shapes for this section */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#ff6b6b]/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#4ecdc4]/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#ffe66d]/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* SVG Connection Lines - Bold artistic style */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
        viewBox="0 0 900 500"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="boldGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="50%" stopColor="#4ecdc4" />
            <stop offset="100%" stopColor="#ffe66d" />
          </linearGradient>
          <linearGradient id="boldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ecdc4" />
            <stop offset="100%" stopColor="#ff6b6b" />
          </linearGradient>
          <filter id="boldGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Bold angular connection paths */}
        <path
          id="boldPath1"
          d="M 130 120 L 200 120 L 280 180 L 380 250"
          stroke="url(#boldGrad1)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        />
        <path
          id="boldPath2"
          d="M 130 250 L 250 250 L 380 250"
          stroke="url(#boldGrad1)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          className={`transition-all duration-1000 delay-200 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        />
        <path
          id="boldPath3"
          d="M 130 380 L 200 380 L 280 320 L 380 250"
          stroke="url(#boldGrad1)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-all duration-1000 delay-400 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Right side paths */}
        <path
          id="boldPath4"
          d="M 520 250 L 620 180 L 700 120 L 770 120"
          stroke="url(#boldGrad2)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-all duration-1000 delay-600 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        />
        <path
          id="boldPath5"
          d="M 520 250 L 650 250 L 770 250"
          stroke="url(#boldGrad2)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          className={`transition-all duration-1000 delay-800 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        />
        <path
          id="boldPath6"
          d="M 520 250 L 620 320 L 700 380 L 770 380"
          stroke="url(#boldGrad2)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-all duration-1000 delay-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Large animated traveling nodes */}
        {mounted && (
          <>
            <circle r="10" fill="#ff6b6b" filter="url(#boldGlow)">
              <animateMotion dur="2s" repeatCount="indefinite">
                <mpath href="#boldPath1" />
              </animateMotion>
            </circle>
            <circle r="12" fill="#4ecdc4" filter="url(#boldGlow)">
              <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.3s">
                <mpath href="#boldPath2" />
              </animateMotion>
            </circle>
            <circle r="10" fill="#ffe66d" filter="url(#boldGlow)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="0.6s">
                <mpath href="#boldPath3" />
              </animateMotion>
            </circle>
            <circle r="10" fill="#4ecdc4" filter="url(#boldGlow)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="1s">
                <mpath href="#boldPath4" />
              </animateMotion>
            </circle>
            <circle r="12" fill="#ff6b6b" filter="url(#boldGlow)">
              <animateMotion dur="1.8s" repeatCount="indefinite" begin="1.3s">
                <mpath href="#boldPath5" />
              </animateMotion>
            </circle>
            <circle r="10" fill="#ffe66d" filter="url(#boldGlow)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="1.6s">
                <mpath href="#boldPath6" />
              </animateMotion>
            </circle>
          </>
        )}
      </svg>

      {/* Left side - Integration cards with bold styling */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-10 z-10">
        <IntegrationCard logo="jira" name="Jira" color="#0052CC" delay={0} />
        <IntegrationCard logo="slack" name="Slack" color="#4A154B" delay={100} />
        <IntegrationCard logo="confluence" name="Confluence" color="#172B4D" delay={200} />
      </div>

      {/* Center - TypeQuest with bold artistic frame */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="relative group">
          {/* Animated geometric frame */}
          <div className="absolute -inset-8">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b6b] via-[#4ecdc4] to-[#ffe66d] rounded-[40px] animate-spin-slow opacity-40 blur-sm" />
            <div className="absolute inset-2 bg-gradient-to-r from-[#ffe66d] via-[#ff6b6b] to-[#4ecdc4] rounded-[36px] animate-spin-reverse opacity-30 blur-sm" />
          </div>

          {/* Bold geometric accents */}
          <div className="absolute -top-4 -left-4 w-8 h-8 border-4 border-[#ff6b6b] rotate-45 animate-pulse" />
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-4 border-[#4ecdc4] rotate-12 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute -top-4 -right-4 w-6 h-6 bg-[#ffe66d] rounded-full animate-bounce" style={{ animationDelay: '1s' }} />

          {/* Main card */}
          <div className="relative bg-white dark:bg-gray-800 rounded-[32px] p-10 shadow-2xl border-4 border-gray-100 dark:border-gray-700 group-hover:border-[#ff6b6b]/50 transition-all duration-500">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/typequest-logo-levelup.svg"
              alt="TypeQuest"
              className="w-28 h-28 mx-auto mb-4 drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
            />
            <p className="text-2xl font-black text-gray-900 dark:text-white text-center tracking-tight">TypeQuest</p>
            <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b6b] to-[#4ecdc4] text-center mt-1">AI Canvas</p>
          </div>
        </div>
      </div>

      {/* Right side - Output nodes */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-10 z-10">
        <OutputCard icon={Target} name="OKRs" color="#4ecdc4" delay={300} />
        <OutputCard icon={FileText} name="PRDs" color="#ff6b6b" delay={400} />
        <OutputCard icon={BarChart3} name="Metrics" color="#ffe66d" delay={500} />
      </div>
    </div>
  );
}

// Bold integration card component
function IntegrationCard({ logo, name, color, delay }: { logo: string; name: string; color: string; delay: number }) {
  const logos: Record<string, React.ReactNode> = {
    jira: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0z"/>
      </svg>
    ),
    slack: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
      </svg>
    ),
    confluence: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M.87 18.257c-.248.382-.53.875-.763 1.245a.764.764 0 0 0 .255 1.04l4.965 3.054a.764.764 0 0 0 1.058-.26c.199-.332.454-.763.733-1.221 1.967-3.247 3.945-2.853 7.508-1.146l4.957 2.378a.765.765 0 0 0 1.028-.382l2.36-5.329a.765.765 0 0 0-.382-1.003c-1.04-.497-2.476-1.182-3.93-1.878C11.04 11.263 3.531 10.463.87 18.257zM23.131 5.743c.249-.405.531-.875.764-1.245a.764.764 0 0 0-.256-1.04L18.675.404a.764.764 0 0 0-1.058.26c-.2.332-.455.763-.734 1.22-1.966 3.248-3.944 2.854-7.508 1.147L4.418.653a.764.764 0 0 0-1.027.382L1.03 6.364a.764.764 0 0 0 .382 1.003c1.04.497 2.476 1.181 3.93 1.877 7.62 3.493 15.13 4.293 17.79-3.5z"/>
      </svg>
    )
  };

  return (
    <div
      className="group flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xl border-4 border-gray-100 dark:border-gray-700 transform hover:scale-110 hover:-translate-x-2 hover:rotate-1 transition-all duration-300 hover:shadow-2xl animate-fade-in"
      style={{ animationDelay: `${delay}ms`, borderColor: `${color}30` }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-white transform group-hover:rotate-12 transition-transform"
        style={{ backgroundColor: color }}
      >
        {logos[logo]}
      </div>
      <span className="font-bold text-lg text-gray-900 dark:text-white">{name}</span>
    </div>
  );
}

// Bold output card component
function OutputCard({ icon: Icon, name, color, delay }: { icon: React.ElementType; name: string; color: string; delay: number }) {
  return (
    <div
      className="group flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-xl border-4 transform hover:scale-110 hover:translate-x-2 hover:-rotate-1 transition-all duration-300 hover:shadow-2xl animate-fade-in"
      style={{ animationDelay: `${delay}ms`, borderColor: `${color}60` }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center transform group-hover:-rotate-12 transition-transform"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-7 h-7" style={{ color }} />
      </div>
      <span className="font-bold text-lg text-gray-900 dark:text-white">{name}</span>
    </div>
  );
}

// Bold feature card with geometric accents
function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  index
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  index: number;
}) {
  const rotations = [-2, 1, -1, 2, -1.5, 1.5, -0.5];
  const rotation = rotations[index % rotations.length];

  return (
    <div
      className="group relative p-8 rounded-3xl bg-white dark:bg-gray-800 border-4 border-gray-100 dark:border-gray-700 hover:border-transparent transition-all duration-500 transform hover:scale-105 hover:shadow-2xl"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Geometric accent */}
      <div
        className="absolute -top-3 -right-3 w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: color }}
      />
      <div
        className="absolute -bottom-2 -left-2 w-6 h-6 rotate-45 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: color }}
      />

      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-8 h-8" style={{ color }} />
      </div>
      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

// Bold use case card with proper workflow diagram
function UseCaseCard({
  icon: Icon,
  color,
  title,
  subtitle,
  description,
  steps
}: {
  icon: React.ElementType;
  color: string;
  title: string;
  subtitle: string;
  description: string;
  steps: { icon: React.ElementType | string; label: string; color: string }[];
}) {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-[32px] p-8 border-4 border-gray-100 dark:border-gray-700 hover:border-transparent hover:shadow-2xl transition-all duration-500 overflow-hidden">
      {/* Abstract background shape */}
      <div
        className="absolute -right-20 -top-20 w-40 h-40 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ backgroundColor: color }}
      />

      <div className="relative">
        <div className="flex items-start gap-5 mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-8 h-8" style={{ color }} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm font-medium mt-1" style={{ color }}>{subtitle}</p>
          </div>
        </div>

        {/* Workflow visualization with connected steps */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl p-6 mb-5">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center flex-1">
                {/* Step node */}
                <div className="flex flex-col items-center flex-1">
                  <div
                    className="w-14 h-14 rounded-xl border-3 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: `${step.color}15`,
                      borderColor: `${step.color}50`,
                      borderWidth: '3px'
                    }}
                  >
                    {typeof step.icon === 'string' ? (
                      <span className="text-sm font-black" style={{ color: step.color }}>{step.icon}</span>
                    ) : (
                      <step.icon className="w-6 h-6" style={{ color: step.color }} />
                    )}
                  </div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{step.label}</span>
                </div>

                {/* Connection arrow */}
                {i < steps.length - 1 && (
                  <div className="flex-shrink-0 px-1 -mt-6">
                    <svg width="40" height="20" viewBox="0 0 40 20" className="text-gray-300 dark:text-gray-600">
                      <defs>
                        <linearGradient id={`arrowGrad${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={step.color} stopOpacity="0.6" />
                          <stop offset="100%" stopColor={steps[i + 1].color} stopOpacity="0.6" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 10 L 30 10 M 25 5 L 32 10 L 25 15"
                        stroke={`url(#arrowGrad${i})`}
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Animated traveling dot */}
                      <circle r="3" fill={step.color}>
                        <animate
                          attributeName="cx"
                          values="0;30;0"
                          dur="2s"
                          repeatCount="indefinite"
                          begin={`${i * 0.3}s`}
                        />
                        <animate
                          attributeName="cy"
                          values="10;10;10"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// TypeQuest logo
function TypeQuestLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/typequest-logo-levelup.svg" alt="TypeQuest" className="w-12 h-12" />
      <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">TypeQuest</span>
    </div>
  );
}

// Additional logo components
function NotionLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-xl bg-black text-white ${className}`}>
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.906c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.934z"/>
      </svg>
    </div>
  );
}

function LinearLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-xl bg-[#5E6AD2] text-white ${className}`}>
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M3.046 10.257a9.01 9.01 0 0 1 .58-1.968l8.085 8.085a9.01 9.01 0 0 1-1.968.58L3.046 10.26z"/>
      </svg>
    </div>
  );
}

function FigmaLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-xl bg-black text-white ${className}`}>
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491z"/>
      </svg>
    </div>
  );
}

// ============================================
// MAIN LANDING PAGE
// ============================================

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      setEmail('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden relative">
      {/* Custom Picasso-style animations */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(10deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(-8deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 30s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 25s linear infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 4s ease infinite;
        }
      `}</style>

      {/* Abstract background */}
      <AbstractBackground />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b-4 border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <TypeQuestLogo />
            <Link href="/user/login">
              <Button className="bg-gradient-to-r from-[#ff6b6b] to-[#e85555] hover:from-[#e85555] hover:to-[#d14545] text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-4 sm:px-6 lg:px-8">
        <HeroArt />
        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-[#ff6b6b]/20 to-[#4ecdc4]/20 border-2 border-[#ff6b6b]/30 mb-10 animate-fade-in">
              <Sparkles className="w-5 h-5 text-[#ff6b6b] animate-pulse" />
              <span className="font-bold text-[#ff6b6b]">AI-Powered Product Management</span>
            </div>

            {/* Bold headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-gray-900 dark:text-white leading-[0.95] mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Your entire{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b6b] via-[#4ecdc4] to-[#ffe66d] animate-gradient">
                  product lifecycle
                </span>
                {/* Bold underline */}
                <svg className="absolute -bottom-2 left-0 w-full h-4" viewBox="0 0 400 16" preserveAspectRatio="none">
                  <path d="M0,8 Q100,16 200,8 T400,8" stroke="#ff6b6b" strokeWidth="6" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ecdc4] to-[#ff6b6b]">connected</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              TypeQuest connects your OKRs, PRDs, specs, and tasks in a <span className="font-bold text-gray-900 dark:text-white">visual canvas powered by AI</span>. From idea to launch.
            </p>

            {/* Email Signup */}
            <div className="max-w-xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {isSubmitted ? (
                <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#4ecdc4]/20 to-[#4ecdc4]/10 border-4 border-[#4ecdc4]/30">
                  <div className="w-12 h-12 rounded-full bg-[#4ecdc4] flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-lg text-[#4ecdc4]">You&apos;re on the list! We&apos;ll be in touch soon.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 h-16 px-6 rounded-2xl border-4 border-gray-200 dark:border-gray-700 focus:border-[#ff6b6b] text-lg bg-white/90 dark:bg-gray-800/90"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-16 px-10 rounded-2xl bg-gradient-to-r from-[#ff6b6b] to-[#e85555] hover:from-[#e85555] hover:to-[#d14545] text-white font-black text-lg shadow-2xl shadow-[#ff6b6b]/30 hover:shadow-[#ff6b6b]/50 hover:-translate-y-1 transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        Get Early Access
                        <ArrowRight className="w-6 h-6 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              )}
              {error && <p className="mt-4 text-red-500 font-medium">{error}</p>}
              <p className="mt-5 text-gray-500 dark:text-gray-400 font-medium">
                Join <span className="text-[#ff6b6b] font-bold">500+ PMs</span> waiting for early access
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Visual Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white mb-6">
              All your tools,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ecdc4] to-[#ff6b6b]">unified</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Connect the tools you already use. TypeQuest syncs everything into a single source of truth.
            </p>
          </div>

          {/* Bold Integration Diagram */}
          <AbstractConnectionDiagram />

          {/* Additional logos */}
          <div className="flex items-center justify-center gap-8 mt-20">
            <span className="text-gray-500 font-medium">Also connects with:</span>
            <div className="flex items-center gap-4">
              <NotionLogo className="w-12 h-12 hover:scale-125 hover:rotate-6 transition-all cursor-pointer" />
              <LinearLogo className="w-12 h-12 hover:scale-125 hover:-rotate-6 transition-all cursor-pointer" />
              <FigmaLogo className="w-12 h-12 hover:scale-125 hover:rotate-6 transition-all cursor-pointer" />
            </div>
            <span className="text-gray-500 font-medium">and more...</span>
          </div>

          {/* MCP Protocol badge */}
          <div className="flex items-center justify-center mt-10">
            <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 border-4 border-gray-200 dark:border-gray-700 hover:border-[#4ecdc4]/50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-[#4ecdc4]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Cpu className="w-5 h-5 text-[#4ecdc4]" />
              </div>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                Powered by <span className="font-black text-gray-900 dark:text-white">MCP Protocol</span> — works with any LLM
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section - Asymmetric Layout */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900/50 dark:via-gray-800/50 dark:to-gray-900/50 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-20 left-0 w-96 h-96 bg-[#ff6b6b]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-[#4ecdc4]/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white mb-6">
              From idea to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b6b] to-[#4ecdc4]">launch</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See how product teams use TypeQuest across the entire development lifecycle.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <UseCaseCard
              icon={Target}
              color="#4ecdc4"
              title="Product Discovery"
              subtitle="Research → Problems → Opportunities"
              description="Capture user problems, map them to objectives, and auto-generate PRDs with AI that understands your context."
              steps={[
                { icon: 'P1', label: 'Problem', color: '#ff6b6b' },
                { icon: Target, label: 'Objective', color: '#4ecdc4' },
                { icon: FileText, label: 'PRD', color: '#5E6AD2' }
              ]}
            />
            <UseCaseCard
              icon={BarChart3}
              color="#ff6b6b"
              title="OKR Planning"
              subtitle="Objectives → Key Results → Metrics"
              description="Visually connect company objectives to measurable key results and track real-time metrics."
              steps={[
                { icon: Target, label: 'Objective', color: '#4ecdc4' },
                { icon: 'KR', label: 'Key Result', color: '#3dbdb4' },
                { icon: BarChart3, label: 'Metric', color: '#c9a800' }
              ]}
            />
            <UseCaseCard
              icon={GitBranch}
              color="#0052CC"
              title="Sprint Execution"
              subtitle="Jira Sync → Change Proposals → Approvals"
              description="Jira issues automatically become change proposals. AI links them to your PRD."
              steps={[
                { icon: GitBranch, label: 'Jira Issue', color: '#0052CC' },
                { icon: Sparkles, label: 'AI Review', color: '#ff6b6b' },
                { icon: Check, label: 'Approved', color: '#4ecdc4' }
              ]}
            />
            <UseCaseCard
              icon={Zap}
              color="#4A154B"
              title="Cross-team Alignment"
              subtitle="Slack → Meeting Notes → Action Items"
              description="Meeting transcripts become structured notes. AI extracts action items automatically."
              steps={[
                { icon: Zap, label: 'Slack', color: '#4A154B' },
                { icon: FileText, label: 'Notes', color: '#666666' },
                { icon: Check, label: 'Tasks', color: '#ff6b6b' }
              ]}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white mb-6">
              Built for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ecdc4] to-[#ff6b6b]">how PMs work</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Not another project tracker. A thinking canvas that evolves with your product.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={Target} title="Visual OKR Canvas" description="Map objectives, key results, and metrics on an infinite canvas." color="#4ecdc4" index={0} />
            <FeatureCard icon={Sparkles} title="AI-Powered Requirements" description="Generate comprehensive requirements from problems and objectives." color="#ff6b6b" index={1} />
            <FeatureCard icon={GitBranch} title="Change Proposals" description="AI creates change proposals linked to your PRDs automatically." color="#0052CC" index={2} />
            <FeatureCard icon={Zap} title="Real-time Sync" description="Two-way sync with Jira, Slack, and Confluence." color="#ffe66d" index={3} />
            <FeatureCard icon={BarChart3} title="Metrics Tracking" description="Track the metrics that matter for each key result." color="#ff6b6b" index={4} />
            <FeatureCard icon={FileText} title="Living Documents" description="PRDs and specs that stay connected to your canvas." color="#4ecdc4" index={5} />
            <FeatureCard icon={Cpu} title="Any AI, Your Choice" description="Built on MCP protocol. Connect any LLM provider." color="#5E6AD2" index={6} />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Bold background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b6b]/10 via-transparent to-[#4ecdc4]/10" />
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#ff6b6b] via-[#4ecdc4] to-[#ffe66d]" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-[#4ecdc4]/20 to-[#4ecdc4]/10 border-2 border-[#4ecdc4]/30 mb-10">
            <Zap className="w-5 h-5 text-[#4ecdc4]" />
            <span className="font-bold text-[#4ecdc4]">Early Access</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white mb-6">
            Join the waitlist
          </h2>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Get early access, shape the product, and never pay full price.
          </p>

          {/* Email form */}
          <div className="max-w-xl mx-auto">
            {isSubmitted ? (
              <div className="flex items-center justify-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#4ecdc4]/20 to-[#4ecdc4]/10 border-4 border-[#4ecdc4]/30">
                <div className="w-12 h-12 rounded-full bg-[#4ecdc4] flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-lg text-[#4ecdc4]">You&apos;re on the list!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-16 px-6 rounded-2xl border-4 border-gray-200 dark:border-gray-700 focus:border-[#ff6b6b] text-lg bg-white/90 dark:bg-gray-800/90"
                  required
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-16 px-10 rounded-2xl bg-gradient-to-r from-[#ff6b6b] to-[#e85555] hover:from-[#e85555] hover:to-[#d14545] text-white font-black text-lg shadow-2xl shadow-[#ff6b6b]/30 hover:shadow-[#ff6b6b]/50 hover:-translate-y-1 transition-all duration-300"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Get Access
                      <ArrowRight className="w-6 h-6 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap items-center justify-center gap-10 mt-12">
            {['Free during beta', 'Early adopter pricing', 'Shape the roadmap'].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#4ecdc4]/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#4ecdc4]" />
                </div>
                <span className="font-medium text-gray-600 dark:text-gray-400">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t-4 border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <TypeQuestLogo />
            <div className="flex items-center gap-8 text-gray-500 dark:text-gray-400 font-medium">
              <Link href="/privacy" className="hover:text-[#ff6b6b] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#ff6b6b] transition-colors">Terms</Link>
              <span>&copy; {new Date().getFullYear()} TypeQuest</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
