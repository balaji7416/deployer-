import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/auth/useAuth";
import { User as UserIcon, LogOut, ChevronDown } from "lucide-react";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full bg-neutral-800 p-1 pr-2.5 border border-neutral-700/60 hover:border-neutral-600 transition-colors cursor-pointer"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-xs">
          {user?.username ? (
            user.username.charAt(0).toUpperCase()
          ) : (
            <UserIcon size={14} />
          )}
        </div>
        <span className="text-xs font-medium text-neutral-300 max-w-[100px] truncate">
          {user?.username || "Account"}
        </span>
        <ChevronDown size={14} className="text-neutral-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-800 bg-neutral-900 p-1.5 shadow-xl z-50 animate-in fade-in  duration-150">
          <div className="px-3 py-2 border-b border-neutral-800/80 mb-1">
            <p className="text-xs font-semibold text-neutral-200 truncate">
              {user?.username}
            </p>
            <p className="text-[11px] text-neutral-400 truncate">
              {user?.email || "Signed in"}
            </p>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
