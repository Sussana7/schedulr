import { Flame, Lightbulb } from "lucide-react";

export default function Progress() {
  const dayStreak = 14;

  return (
    <div className="pb-32 px-6 space-y-8 relative pt-8">
      <section>
        <h2 className="text-scholar-gold font-noto text-xs font-bold tracking-widest uppercase mb-2">
          CONSISTENCY
        </h2>

        <div className="flex justify-between items-end mb-4">
          <p className="text-xl font-scholar text-emerald-400 italic">
            {dayStreak} Day Streak
          </p>
          <div className="relative w-12 h-12 rounded-full border border-orange-400/50 flex items-center justify-center bg-orange-400/10">
            <Flame size={24} className="text-orange-400 fill-orange-400" />
            <div className="absolute inset-0 rounded-full bg-orange-400 blur-md opacity-20" />
          </div>
        </div>

        <div className="w-full h-2 bg-emerald-900/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 shadow-[0_0_10px_#34d399]"
            style={{ width: "70%" }}
          />
        </div>
      </section>

      <div className="relative p-6 rounded-[2rem] bg-emerald-900/20 border border-emerald-500/20 overflow-hidden group">
        <div className="absolute top-2 right-4 opacity-10">
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-scholar-gold"
          >
            <path
              d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="flex gap-4 items-start">
          <div className="mt-1 p-2 bg-orange-400/10 rounded-lg">
            <Lightbulb
              size={20}
              className="text-orange-400 fill-orange-400/20"
            />
          </div>
          <p className="text-emerald-50 font-scholar text-xs italic leading-relaxed"></p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-scholar-gold font-noto text-xs font-bold tracking-widest uppercase">
          MASTERY OVERVIEW
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 h-64 rounded-[2.5rem] bg-emerald-900/20 border border-emerald-500/10 flex flex-col items-center justify-center p-6"></div>

          <div className="h-48 rounded-[2.5rem] bg-emerald-900/20 border border-emerald-500/10 flex flex-col items-center justify-center p-4"></div>

          <div className="h-48 rounded-[2.5rem] bg-emerald-900/20 border border-emerald-500/10 flex flex-col items-center justify-center p-4"></div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-scholar-gold font-noto text-xs font-bold tracking-widest uppercase">
          LEARNING VELOCITY
        </h2>

        <div className="w-full rounded-[2.5rem] bg-emerald-900/20 border border-emerald-500/10 p-8 min-h-[160px] relative"></div>
      </section>
    </div>
  );
}
