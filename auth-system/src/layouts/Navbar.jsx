import { Link, NavLink } from "react-router";
import { Menu, ShieldCheck } from "lucide-react";
import { ROUTES } from "../constants/routePaths";
import { APP_NAME } from "../constants/app";
import ProfileMenu from "./ProfileMenu";

// user:            null for a visitor, or { fullName, role } when signed in
// onMenuClick:     if given, shows the menu button (phones) that opens the sidebar
// showPublicLinks: shows Home / Announcements links (visitors only)
function Navbar({ user, onMenuClick, showPublicLinks = false, onLogout }) {
  const publicLinkClass = ({ isActive }) =>
    `inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-medium transition-colors duration-150 sm:px-3 ${
      isActive
        ? "bg-brand-50 text-brand-700"
        : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
    }`;

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left side: menu button (phones, signed in), logo, public links */}
        <div className="flex items-center gap-2">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open menu"
              className="grid h-11 w-11 place-items-center rounded-lg text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700 lg:hidden"
            >
              <Menu size={22} aria-hidden="true" />
            </button>
          )}

          <Link
            to={ROUTES.HOME}
            className="group flex min-h-11 items-center gap-2 rounded-lg pr-2 font-bold text-slate-900 transition-colors hover:text-brand-700"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white transition-transform duration-150 group-hover:scale-105">
              <ShieldCheck size={18} aria-hidden="true" />
            </span>
            <span className="hidden sm:inline">{APP_NAME}</span>
          </Link>

          {showPublicLinks && (
            <nav aria-label="Public" className="ml-2 flex items-center">
              <NavLink to={ROUTES.HOME} end className={publicLinkClass}>
                Home
              </NavLink>
              <NavLink to={ROUTES.ANNOUNCEMENTS} className={publicLinkClass}>
                Announcements
              </NavLink>
            </nav>
          )}
        </div>

        {/* Right side: Sign In button for visitors, name + menu for signed-in users */}
        <div>
          {user ? (
            <ProfileMenu user={user} onLogout={onLogout} />
          ) : (
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-all duration-150 hover:bg-brand-700 hover:shadow-md"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
