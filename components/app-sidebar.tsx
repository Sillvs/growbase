"use client"

import * as React from "react"
import { useAuth } from "@/lib/auth"
import {
  IconCalendar,
  IconDashboard,
  IconDna,
  IconFileText,
  IconInnerShadowTop,
  IconPlug,
  IconSparkles,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
      isActive: true,
    },
    {
      title: "Calendar",
      url: "#",
      icon: IconCalendar,
    },
  ],
  navGrowth: [
    {
      title: "Create Content",
      icon: IconFileText,
      url: "#",
    },
    {
      title: "Optimize Content",
      icon: IconSparkles,
      url: "#",
    },
    {
      title: "Get Plugin",
      icon: IconPlug,
      url: "#",
      disabled: true,
      badge: "Soon",
    },
  ],
  navSecondary: [
    {
      title: "Brand DNA",
      url: "#",
      icon: IconDna,
    },
    {
      title: "Integrations",
      url: "#",
      icon: IconPlug,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const userData = {
    name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'User',
    email: user?.email || 'user@example.com',
    avatar: user?.user_metadata?.avatar_url || "/avatars/default.jpg",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Growbase</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.navGrowth} title="Growth" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
