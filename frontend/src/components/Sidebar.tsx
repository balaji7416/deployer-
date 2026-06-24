import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useState } from "react";
import { X, Menu, User, ChevronUp, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/auth/useAuth";

const links = [
  { name: "Dashboard", path: "/" },
  { name: "Deployments", path: "/deployments" },
  { name: "Deploy", path: "/deploy" },
];

function Sidebar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Auto-close on mobile when navigating
  const handleNavClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile menu button - only visible on mobile */}
      {isMobile && (
        <button
          onClick={() => setOpen((prev) => !prev)}
          className={clsx(
            "fixed top-4 left-4 z-51 p-2",
            " bg-neutral-800 rounded-md text-neutral-300 hover:bg-neutral-700 border border-neutral-700",
            "transition-all duration-300 ease-in-out",
          )}
        >
          {open ? <X size={26} /> : <Menu size={20} />}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "flex flex-col justify-between",
          "fixed top-0 left-0 h-full z-50",
          "flex flex-col",
          "w-72 sm:w-80 bg-neutral-900 border-r border-neutral-700 p-2",
          "transition-all duration-300 ease-in-out",
          // Mobile behavior
          isMobile && (open ? "translate-x-0" : "-translate-x-full"),
          // Desktop behavior - always visible
          !isMobile && "translate-x-0 relative",
        )}
      >
        <div className="p-2 w-full hover:bg-neutral-800 h-12 rounded-md scale-[1.01]">
          <h1 className="text-lg text-neutral-500 text-center">Deployer</h1>
        </div>

        <nav className="flex flex-col gap-2 w-full p-2">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                clsx(
                  "px-3 py-2 rounded-md border border-neutral-800 text-neutral-300 hover:scale-[1.01] transition-transform",
                  isActive && "bg-neutral-800 scale-[1.01] border-neutral-950",
                )
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        <div
          className={clsx(
            "flex items-center justify-between",
            "p-5 hover:bg-neutral-800 rounded-md scale-[1.01] border border-neutral-800",
            "transition-all duration-300 ease-in-out",
            "cursor-pointer",
          )}
          onClick={() => {
            setProfileOpen((prev) => !prev);
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full p-1 bg-neutral-600 flex items-center justify-center">
              <User size={26} />
            </div>
            <p className="text-sm text-neutral-400 mt-2">
              {user?.username || "user not found"}
            </p>
          </div>
          <div className="rounded-xl p-2 text-neutral-500 active:bg-neutral-700">
            {profileOpen ? <ChevronDown /> : <ChevronUp />}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
