"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Target,
  BarChart3,
  Settings,
  Building2,
  Users,
  CreditCard,
  Shield,
  HelpCircle,
  Sparkles,
  Bot,
} from "lucide-react"

import { NavMain } from "@/components/sub/navbars/nav-main"
import { NavUser } from "@/components/sub/navbars/nav-user"
import { OrgSwitcher } from "@/components/organization/OrgSwitcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

const mainNavItems = [
  {
    title: "Canvases",
    url: "/canvas",
    icon: LayoutDashboard,
    isActive: true,
    description: "Your workspaces",
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FileText,
    description: "Team docs",
  },
  {
    title: "Agents",
    url: "/agents",
    icon: Bot,
    description: "AI agents",
  },
  {
    title: "OKRs",
    url: "/okrs",
    icon: Target,
    description: "Objectives & key results",
  },
  {
    title: "Metrics",
    url: "/metrics",
    icon: BarChart3,
    description: "Track performance",
  },
]

const organizationNavItems = [
  {
    title: "Team Members",
    url: "/organization/members",
    icon: Users,
  },
  {
    title: "Billing",
    url: "/organization/billing",
    icon: CreditCard,
  },
  {
    title: "Roles & Permissions",
    url: "/organization/roles",
    icon: Shield,
  },
  {
    title: "Settings",
    url: "/organization/settings",
    icon: Settings,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const user = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50" {...props}>
      <SidebarHeader className="border-b border-border/50 px-2 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
            <span className="text-sm font-black text-white">T</span>
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Typequest
          </span>
        </div>

        {/* Organization Switcher */}
        <OrgSwitcher />
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup className="py-4">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2 px-2">
            Workspace
          </SidebarGroupLabel>
          <SidebarMenu>
            {mainNavItems.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.description || item.title}
                    className={`
                      group relative rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-700 dark:text-violet-400 font-medium'
                        : 'hover:bg-muted/50'
                      }
                    `}
                  >
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2.5">
                      <item.icon className={`h-4 w-4 ${isActive ? 'text-violet-600' : 'text-muted-foreground group-hover:text-foreground'}`} />
                      <span>{item.title}</span>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-violet-600 to-purple-600 rounded-r-full" />
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Organization Settings */}
        <SidebarGroup className="py-4 border-t border-border/50">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-2 px-2">
            Organization
          </SidebarGroupLabel>
          <SidebarMenu>
            {organizationNavItems.map((item) => {
              const isActive = pathname === item.url
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={`
                      group rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-muted/50 text-foreground font-medium'
                        : 'hover:bg-muted/50'
                      }
                    `}
                  >
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className={`h-4 w-4 ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                      <span className="text-sm">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Help Section */}
        <SidebarGroup className="mt-auto py-4 border-t border-border/50">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Help & Support"
                className="hover:bg-muted/50 rounded-lg"
              >
                <a href="/help" className="flex items-center gap-3 px-3 py-2">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Help & Support</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-2">
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
