import { NavLink } from "react-router";
import { LogOut, X } from "lucide-react";
import { APP_NAME } from "../constants/app";

const itemBase =
  "group relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 lg:min-h-10";

// One link in the sidebar. NavLink knows if its page is the current one.
function SidebarLink({ item, onNavigate }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `${itemBase} ${
          isActive
            ? "bg-brand-100 text-brand-800"
            : "text-slate-700 hover:translate-x-1 hover:bg-brand-50 hover:text-brand-700"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* The blue bar on the left edge */}
          <span
            aria-hidden="true"
            className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-600 transition-opacity duration-150 ${
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
            }`}
          />
          <Icon
            size={18}
            aria-hidden="true"
            className="shrink-0 transition-transform duration-150 group-hover:scale-110"
          />
          {item.label}
        </>
      )}
    </NavLink>
  );
}

// navigation: the list of links for this person's role
// isOpen / onClose: control the drawer on phones
function Sidebar({ navigation, isOpen, onClose, onLogout }) {
  const content = (
    <div className="flex min-h-full flex-col justify-between gap-4 p-4">
      <nav aria-label="Main navigation" className="space-y-1">
        {navigation.map((item) => (
          <SidebarLink key={item.to} item={item} onNavigate={onClose} />
        ))}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className={`${itemBase} w-full text-red-600 hover:translate-x-1 hover:bg-red-50`}
      >
        <LogOut size={18} aria-hidden="true" />
        Logout
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop (lg and up): permanent sidebar that stays in place while the page scrolls */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        <div className="sticky top-16 h-[calc(100dvh-4rem)] overflow-y-auto">
          {content}
        </div>
      </aside>

      {/* Phones and tablets: drawer that opens over the page */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col border-r border-slate-200 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <span className="font-bold text-slate-900">{APP_NAME}</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="grid h-11 w-11 place-items-center rounded-lg text-slate-600 hover:bg-brand-50 hover:text-brand-700"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{content}</div>
          </aside>
        </div>
      )}
    </>
  );
}

export default Sidebar;
