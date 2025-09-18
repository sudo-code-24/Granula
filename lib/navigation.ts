import { Home, User, Settings, Users, BarChart3, FileText, HelpCircle } from 'lucide-react';

export interface NavigationItem {
  title: string;
  icon: any;
  href: string;
  isActive?: boolean;
  group?: 'navigation' | 'admin' | 'support';
}

export const navigationConfig = {
  navigation: [
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
      title: "Analytics",
      icon: BarChart3,
      href: "/analytics",
    },
    {
      title: "Documents",
      icon: FileText,
      href: "/documents",
    },
  ] as NavigationItem[],

  admin: [
    {
      title: "User Management",
      icon: Users,
      href: "/admin",
    },
  ] as NavigationItem[],

  support: [
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
  ] as NavigationItem[],
};

/**
 * Get the page title for a given pathname
 * @param pathname - The current pathname
 * @param userRole - The user's role (optional, for admin-specific routes)
 * @returns The page title or a default fallback
 */
export function getPageTitle(pathname: string, userRole?: string): string {
  // Create a flat array of all navigation items
  const allItems = [
    ...navigationConfig.navigation,
    ...(userRole === 'admin' ? navigationConfig.admin : []),
    ...navigationConfig.support,
  ];

  // Find the matching item by href
  const matchingItem = allItems.find(item => item.href === pathname);

  // Return the title if found, otherwise return a default
  return matchingItem?.title || 'Dashboard';
}

/**
 * Get all navigation items for a specific group
 * @param group - The navigation group
 * @param userRole - The user's role (optional, for admin-specific routes)
 * @returns Array of navigation items for the group
 */
export function getNavigationItems(group: 'navigation' | 'admin' | 'support', userRole?: string): NavigationItem[] {
  if (group === 'admin' && userRole !== 'admin') {
    return [];
  }

  return navigationConfig[group] || [];
}

/**
 * Get all navigation items as a flat array
 * @param userRole - The user's role (optional, for admin-specific routes)
 * @returns Array of all navigation items
 */
export function getAllNavigationItems(userRole?: string): NavigationItem[] {
  return [
    ...navigationConfig.navigation,
    ...(userRole === 'admin' ? navigationConfig.admin : []),
    ...navigationConfig.support,
  ];
}


