import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  // FolderKanban,
  // Globe,
  KeyRound,
  Settings,
} from "lucide-react";

export interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_CONFIG: NavSection[] = [
  {
    title: "GENERAL",
    items: [
      {
        name: "Overview",
        path: "/",
        icon: LayoutDashboard,
      },
      {
        name: "Deployments",
        path: "/deployments",
        icon: Layers,
      },
      {
        name: "New Deployment",
        path: "/deploy",
        icon: PlusCircle,
      },
    ],
  },
  {
    title: "MANAGE",
    items: [
      // {
      //   name: "Projects",
      //   path: "/projects",
      //   icon: FolderKanban,
      //   badge: "Soon",
      //   disabled: true,
      // },
      // {
      //   name: "Domains",
      //   path: "/domains",
      //   icon: Globe,
      //   badge: "Soon",
      //   disabled: true,
      // },
      {
        name: "Env Variables",
        path: "/env",
        icon: KeyRound,
        badge: "Soon",
        disabled: true,
      },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      {
        name: "Settings",
        path: "/settings",
        icon: Settings,
        badge: "Soon",
        disabled: true,
      },
    ],
  },
];
