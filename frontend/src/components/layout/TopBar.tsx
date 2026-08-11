import { useLocation } from "react-router-dom";
import { Menu, Rocket } from "lucide-react";
import UserMenu from "./UserMenu";

interface TopBarProps {
  onToggleMobileMenu: () => void;
}

export function TopBar({ onToggleMobileMenu }: TopBarProps) {
  const location = useLocation();

  const getPageTitle = (pathname: string) => {
    if (pathname === "/") return "Overview";
    if (pathname === "/deployments") return "Deployments";
    if (pathname === "/deploy") return "New Deployment";
    if (pathname.startsWith("/deployment/") || pathname.startsWith("/deployments/")) {
      return "Deployment Details";
    }
    return "Dashboard";
  };

  const title = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-neutral-800 bg-neutral-900/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 md:hidden cursor-pointer"
          aria-label="Toggle mobile menu"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex h-6 w-6 items-center justify-center rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Rocket size={12} />
          </div>
          <h1 className="text-sm font-semibold text-neutral-200">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <UserMenu />
      </div>
    </header>
  );
}

export default TopBar;
