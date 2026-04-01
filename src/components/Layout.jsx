import { Link, useLocation } from "react-router-dom";
import {
  LibraryBigIcon,
  CalendarCheck2Icon,
  LoaderIcon,
  SparklesIcon,
} from "lucide-react";

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#04160e] text-emerald-50">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-serif font-bold text-emerald-400">
          Schedulr
        </h1>
        <div className="w-10 h-10 rounded-full border border-orange-400/50 flex items-center justify-center bg-emerald-900/30">
          <span className="text-xs">S</span>
        </div>
      </div>

      <main className="pb-24 px-6">{children}</main>

      {/* Bottom Navigation */}
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

        <LoaderIcon size={26} className="text-emerald-800" />
        <SparklesIcon size={26} className="text-[#fbbd71]" />
      </div>
    </div>
  );
}
