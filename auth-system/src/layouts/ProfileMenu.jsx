import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ChevronDown, LogOut } from "lucide-react";
import { ROLES } from "../constants/roles";
import { profileMenuItems } from "../constants/navigation";
import { getInitials } from "../utils/getInitials";

function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const items = profileMenuItems[user.role] ?? [];

  // Close the dropdown when clicking outside it or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex min-h-11 items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors duration-150 hover:bg-brand-50 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:pr-3"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-semibold text-white">
          {getInitials(user.fullName)}
        </span>
        <span className="hidden max-w-40 truncate text-sm font-medium text-slate-900 sm:inline">
          {user.fullName}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
        >
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user.fullName}
            </p>
            <p className="text-xs text-slate-500">
              {user.role === ROLES.ADMIN ? "Administrator" : "User"}
            </p>
          </div>

          {items.map(({ label, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors duration-150 hover:bg-brand-50 hover:text-brand-700"
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </Link>
          ))}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors duration-150 hover:bg-red-50"
          >
            <LogOut size={16} aria-hidden="true" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
