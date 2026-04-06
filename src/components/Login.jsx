import { Fingerprint, Mail, Lock } from "lucide-react";

export default function Login() {
  const handleFaceScan = () => {
    console.log("Triggering Camera for Face ID...");
  };

  return (
    <div className="min-h-screen bg-[#04160e] flex flex-col items-center justify-center p-6 space-y-8 font-serif text-emerald-50">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-emerald-400 tracking-wider">
          Schedulr
        </h1>
        <p className="text-emerald-500/60 text-[10px] uppercase tracking-[0.2em]">
          Your intelligent study companion.”{" "}
        </p>
      </div>

      <div className="relative flex flex-col items-center">
        <button
          onClick={handleFaceScan}
          className="relative w-24 h-24 rounded-full border-2 border-[#fbbd71]/40 flex items-center justify-center bg-emerald-900/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-[#fbbd71]/10 animate-pulse rounded-full" />
          <Fingerprint
            size={48}
            className="text-[#fbbd71] opacity-60 absolute"
          />
          <span className="text-3xl font-bold text-[#fbbd71] relative z-10">
            S
          </span>
        </button>

        <div className="mt-6 flex flex-col items-center">
          <span className="text-[#fbbd71] text-[10px] font-sans tracking-[0.3em] font-medium uppercase">
            Face ID Scan
          </span>
          <div className="w-8 h-[1px] bg-[#fbbd71]/30 mt-1" />
        </div>
      </div>

      <div className="w-full max-w-sm bg-emerald-950/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6">
        <form className="space-y-5 font-sans">
          <div className="space-y-2">
            <label className="text-[10px] text-[#fbbd71]/70 uppercase tracking-widest ml-1">
              ENTER EMAIL{" "}
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700"
              />
              <input
                type="email"
                placeholder="archive.ref@schedulr.edu"
                className="w-full bg-[#04160e]/60 border border-emerald-900/50 rounded-xl py-3 pl-12 pr-4 text-emerald-100 placeholder:text-emerald-900 text-sm focus:outline-none focus:border-[#fbbd71]/30 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-[#fbbd71]/70 uppercase tracking-widest ml-1">
              ENTER PASSWORD
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700"
              />
              <input
                type="password"
                placeholder="••••••••••••"
                className="w-full bg-[#04160e]/60 border border-emerald-900/50 rounded-xl py-3 pl-12 pr-4 text-emerald-100 placeholder:text-emerald-900 text-sm focus:outline-none focus:border-[#fbbd71]/30 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#fbbd71] hover:bg-[#fbbd71]/90 text-[#04160e] font-bold py-4 rounded-full transition-all active:scale-[0.98] mt-4"
          >
            VERIFY IDENTITY
          </button>
        </form>
      </div>
    </div>
  );
}
