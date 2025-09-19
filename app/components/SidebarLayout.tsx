"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  User,
  Settings,
  LogOut,
  Users,
  BarChart3,
  UserLock,
  HelpCircle,
  Store,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { CartIcon } from './Cart';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathName = usePathname()

  const handleLogout = () => {
    logout();
  };

  // Function to get the current page title based on pathname
  const getCurrentPageTitle = () => {
    const allItems = [...navigationItems, ...adminItems, ...supportItems];
    const currentItem = allItems.find(item => item.href === pathName);
    return currentItem?.title || 'Dashboard';
  };

  const navigationItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
      isActive: true,
    },
    {
      title: "Profile",
      icon: User,
      href: "/profile",
    },
    {
      title: "Products",
      icon: Store,
      href: "/products",
    },

  ];

  const adminItems = user?.role?.name === 'admin' ? [
    {
      title: "Admin Portal",
      icon: UserLock,
      href: "/admin",
    },
  ] : [];

  const supportItems = [
    {
      title: "Settings",
      icon: Settings,
      href: "/",
    },
    {
      title: "Help & Support",
      icon: HelpCircle,
      href: "/",
    },
  ];

  const navigate = (href: string) => {
    router.push(href);
  }
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Granula</span>
                {/* <span className="text-xs text-muted-foreground">Dashboard</span> */}
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        onClick={() => navigate(item.href)}
                      >
                        <div className="cursor-pointer flex  items-center gap-2">
                          <item.icon />
                          <span className={item.href == pathName ? 'font-bold text-amber-500' : ''}>{item.title}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {adminItems.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>Administration</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          onClick={() => navigate(item.href)}
                        >
                          <div className="cursor-pointer flex items-center gap-2">
                            <item.icon />
                            <span>{item.title}</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            <SidebarGroup>
              <SidebarGroupLabel>Support</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {supportItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        onClick={() => navigate(item.href)}
                      >
                        <div className="cursor-pointer flex items-center gap-2">
                          <item.icon />
                          <span>{item.title}</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center gap-2 px-2 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">
                      {user?.email || 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user?.role?.name || 'User'}
                    </span>
                  </div>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  tooltip="Logout"
                >
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-4">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">{getCurrentPageTitle()}</h1>
            </div>
            <CartIcon />
          </header>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
