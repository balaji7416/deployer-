import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { X, Rocket } from "lucide-react";
import { NAV_CONFIG } from "./nav-config";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex flex-col h-full w-56 border-r border-neutral-800 bg-neutral-900 transition-transform duration-300 ease-in-out md:translate-x-0 shrink-0",
          isMobile && (mobileOpen ? "translate-x-0" : "-translate-x-full"),
          !isMobile && "relative z-20",
        )}
      >
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between border-b border-neutral-800/80 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
              <Rocket size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-neutral-100">
                Deployer
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                v1.0.0
              </span>
            </div>
          </div>

          {isMobile && (
            <button
              onClick={onMobileClose}
              className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_CONFIG.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <div className="px-2 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                {section.title}
              </div>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  if (item.disabled) {
                    return (
                      <div
                        key={item.name}
                        className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-neutral-600 cursor-not-allowed select-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={16} className="text-neutral-600" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-neutral-800/60 text-neutral-400 border border-neutral-800">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => {
                        if (isMobile) onMobileClose();
                      }}
                      className={({ isActive }) =>
                        cn(
                          "relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors",
                          isActive
                            ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 font-semibold"
                            : "text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200",
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-2.5">
                            <Icon
                              size={16}
                              className={
                                isActive ? "text-blue-400" : "text-neutral-400"
                              }
                            />
                            <span>{item.name}</span>
                          </div>
                          {isActive && (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer info */}
        <div className="border-t border-neutral-800/80 p-3 text-[11px] text-neutral-400 flex items-center justify-between">
          <span className="font-mono">Local Platform</span>
          <span
            className="h-2 w-2 rounded-full bg-emerald-500"
            title="Online"
          />
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
