'use client';

import { ReactNode } from 'react';
import { NextAuthProvider } from '@/providers/NextAuthProvider';
import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { availableThemes } from '@/config/themes';

// Initialize Inter font - modern, clean, great for UI
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter'
});

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className={`h-full ${inter.variable}`}>
      <body className="h-full bg-background text-foreground font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={availableThemes}
        >
          <NextAuthProvider>
            {children}
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
