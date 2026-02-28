import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { ThemeSwitcher } from "@/components/theme-switcher"

export function SiteHeader() {
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 h-10 w-10 md:h-7 md:w-7" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 hidden md:block"
        />
        <h1 className="text-base font-medium truncate">Documents</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:block">
            <ThemeSwitcher />
          </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
