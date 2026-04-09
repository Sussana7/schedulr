import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LibraryBigIcon,
  CalendarCheck2Icon,
  LoaderIcon,
  SparklesIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react";
import { supabase } from "../supabaseClient";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#04160e] text-emerald-50">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-serif font-bold text-emerald-400">
          Schedulr
        </h1>

        <div className="relative">
          <div
            onClick={() => setShowDropdown((prev) => !prev)}
            className="w-10 h-10 rounded-full border border-orange-400/50 flex items-center justify-center bg-emerald-900/30 cursor-pointer hover:bg-emerald-900/60 transition-all"
          >
            <span className="text-xs text-emerald-100">S</span>
          </div>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />

              <div className="absolute right-0 top-12 z-50 bg-emerald-950 border border-white/10 rounded-2xl shadow-xl w-44 overflow-hidden">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/login");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-sans tracking-wide text-emerald-300 hover:bg-emerald-900/50 transition-all"
                >
                  <UserIcon size={14} />
                  Profile
                </button>

                <div className="h-[1px] bg-white/5" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-sans tracking-wide text-red-400 hover:bg-red-900/20 transition-all"
                >
                  <LogOutIcon size={14} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <main className="pb-24 px-6">{children}</main>

      <div className="fixed bottom-0 left-0 right-0 h-20 bg-emerald-950/80 backdrop-blur-lg border-t border-white/10 flex items-center justify-around px-4 z-50">
        <Link to="/">
          <LibraryBigIcon
            size={26}
            className={
              location.pathname === "/" ? "text-orange-300" : "text-emerald-800"
            }
          />
        </Link>

        <Link to="/schedule">
          <CalendarCheck2Icon
            size={26}
            className={
              location.pathname === "/schedule"
                ? "text-orange-300"
                : "text-emerald-800"
            }
          />
        </Link>

        <Link to="/progress">
          <LoaderIcon
            size={26}
            className={
              location.pathname === "/progress"
                ? "text-orange-300"
                : "text-emerald-800"
            }
          />
        </Link>

        <Link to="/generator">
          <SparklesIcon
            size={26}
            className={
              location.pathname === "/generator"
                ? "text-orange-300"
                : "text-emerald-800"
            }
          />
        </Link>
      </div>
    </div>
  );
}
