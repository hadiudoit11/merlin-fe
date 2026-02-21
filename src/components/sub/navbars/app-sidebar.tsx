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
  CheckSquare,
  Key,
  Code2,
  Home,
  Calendar,
  Zap,
  Video,
  GitBranch,
  Lightbulb,
  Map,
  Plug,
  FlaskConical,
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
    title: "Home",
    url: "/home",
    icon: Home,
    description: "Dashboard overview",
  },
  {
    title: "Canvases",
    url: "/canvas",
    icon: LayoutDashboard,
    isActive: true,
    description: "Your workspaces",
  },
  {
    title: "Timeline",
    url: "/timeline",
    icon: Calendar,
    description: "Initiative lifecycle",
  },
  {
    title: "Sprints",
    url: "/sprints",
    icon: Zap,
    description: "Sprint cockpit",
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: CheckSquare,
    description: "Action items & to-dos",
  },
  {
    title: "Roadmap",
    url: "/roadmap",
    icon: Map,
    description: "Now / Next / Later",
  },
]

const productNavItems = [
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
  {
    title: "Decisions",
    url: "/decisions",
    icon: GitBranch,
    description: "Decision log",
  },
  {
    title: "Research",
    url: "/research",
    icon: FlaskConical,
    description: "User insights",
  },
]

const toolsNavItems = [
  {
    title: "Documents",
    url: "/documents",
    icon: FileText,
    description: "Team docs",
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: Video,
    description: "Meeting intelligence",
  },
  {
    title: "Agents",
    url: "/agents",
    icon: Bot,
    description: "AI agents",
  },
  {
    title: "Skills",
    url: "/skills",
    icon: Plug,
    description: "Connected apps",
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

const developerNavItems = [
  {
    title: "API Tokens",
    url: "/settings/api-tokens",
    icon: Key,
    description: "Connect Claude & other tools",
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border" {...props}>
      <SidebarHeader className="border-b border-sidebar-border px-2 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 mb-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mb-0">
          <svg width="32" height="32" viewBox="0 0 120 120" className="flex-shrink-0">
            <rect x="10" y="20" width="100" height="90" rx="12" fill="#2d2d2d" stroke="#1a1a1a" strokeWidth="3" />
            <defs>
              <linearGradient id="keyGradSidebar" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a4a4a" />
                <stop offset="100%" stopColor="#2d2d2d" />
              </linearGradient>
            </defs>
            <rect x="18" y="24" width="84" height="74" rx="8" fill="url(#keyGradSidebar)" />
            <path d="M60 40 L75 60 L67 60 L67 80 L53 80 L53 60 L45 60 Z" fill="#ff6b6b" />
          </svg>
          <span className="font-semibold text-lg font-nav text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Typequest
          </span>
        </div>

        {/* Organization Switcher */}
        <OrgSwitcher />
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Navigation - Workspace */}
        <SidebarGroup className="py-4">
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/60 mb-2 px-2 font-nav uppercase tracking-wider">
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
                        ? 'bg-sidebar-accent font-medium'
                        : 'hover:bg-sidebar-accent/50'
                      }
                    `}
                  >
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2.5 font-nav text-sidebar-foreground">
                      <item.icon
                        className={`h-4 w-4 ${isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/80 group-hover:text-sidebar-foreground'}`}
                      />
                      <span className={isActive ? 'text-sidebar-primary' : ''}>{item.title}</span>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-sidebar-primary" />
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Product Navigation */}
        <SidebarGroup className="py-4 border-t border-sidebar-border">
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/60 mb-2 px-2 font-nav uppercase tracking-wider">
            Product
          </SidebarGroupLabel>
          <SidebarMenu>
            {productNavItems.map((item) => {
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
                        ? 'bg-sidebar-accent font-medium'
                        : 'hover:bg-sidebar-accent/50'
                      }
                    `}
                  >
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2 font-nav text-sidebar-foreground">
                      <item.icon
                        className={`h-4 w-4 ${isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/80 group-hover:text-sidebar-foreground'}`}
                      />
                      <span className={`text-sm ${isActive ? 'text-sidebar-primary' : ''}`}>{item.title}</span>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-sidebar-primary" />
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Tools Navigation */}
        <SidebarGroup className="py-4 border-t border-sidebar-border">
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/60 mb-2 px-2 font-nav uppercase tracking-wider">
            Tools
          </SidebarGroupLabel>
          <SidebarMenu>
            {toolsNavItems.map((item) => {
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
                        ? 'bg-sidebar-accent font-medium'
                        : 'hover:bg-sidebar-accent/50'
                      }
                    `}
                  >
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2 font-nav text-sidebar-foreground">
                      <item.icon
                        className={`h-4 w-4 ${isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/80 group-hover:text-sidebar-foreground'}`}
                      />
                      <span className={`text-sm ${isActive ? 'text-sidebar-primary' : ''}`}>{item.title}</span>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-sidebar-primary" />
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Organization Settings */}
        <SidebarGroup className="py-4 border-t border-sidebar-border">
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/60 mb-2 px-2 font-nav uppercase tracking-wider">
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
                        ? 'bg-sidebar-accent font-medium'
                        : 'hover:bg-sidebar-accent/50'
                      }
                    `}
                  >
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2 font-nav text-sidebar-foreground">
                      <item.icon className={`h-4 w-4 ${isActive ? 'text-sidebar-foreground' : 'text-sidebar-foreground/80 group-hover:text-sidebar-foreground'}`} />
                      <span className="text-sm">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Developer Section */}
        <SidebarGroup className="py-4 border-t border-sidebar-border">
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/60 mb-2 px-2 font-nav uppercase tracking-wider">
            Developer
          </SidebarGroupLabel>
          <SidebarMenu>
            {developerNavItems.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.description || item.title}
                    className={`
                      group rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-sidebar-accent font-medium'
                        : 'hover:bg-sidebar-accent/50'
                      }
                    `}
                  >
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2 font-nav text-sidebar-foreground">
                      <item.icon className={`h-4 w-4 ${isActive ? 'text-sidebar-foreground' : 'text-sidebar-foreground/80 group-hover:text-sidebar-foreground'}`} />
                      <span className="text-sm">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Help Section */}
        <SidebarGroup className="mt-auto py-4 border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Help & Support"
                className="hover:bg-sidebar-accent/50 rounded-lg"
              >
                <a href="/help" className="flex items-center gap-3 px-3 py-2 font-nav text-sidebar-foreground group">
                  <HelpCircle className="h-4 w-4 text-sidebar-foreground/80 group-hover:text-sidebar-foreground" />
                  <span className="text-sm">Help & Support</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
