"use client";
import { ReactNode } from "react";
import { NextAuthProvider } from '@/providers/NextAuthProvider';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { DomainCheckProvider } from '@/components/organization/DomainCheckProvider';
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

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <NextAuthProvider>
      <OrganizationProvider>
        <DomainCheckProvider>
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
        </DomainCheckProvider>
      </OrganizationProvider>
    </NextAuthProvider>
  );
}
