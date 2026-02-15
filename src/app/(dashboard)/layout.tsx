"use client";
import { ReactNode } from "react";
import { Open_Sans } from 'next/font/google';
import { NextAuthProvider } from '@/providers/NextAuthProvider';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { AppSidebar } from "@/components/sub/navbars/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SiteHeader } from '@/components/main/site-header';
import { ToastProvider } from "@/components/ui/toast-provider";

// Initialize Open Sans font
const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-open-sans'
});

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <NextAuthProvider>
      <OrganizationProvider>
        <ToastProvider>
          <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset className="flex flex-col min-h-screen">
              <SiteHeader />
              <div className="flex-1 min-h-0 overflow-auto relative">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </ToastProvider>
      </OrganizationProvider>
    </NextAuthProvider>
  );
}
