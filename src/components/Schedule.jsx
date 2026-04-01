import { CheckIcon, PlusIcon, Save, XCircleIcon } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Schedule() {
  const [scheduleItems, setScheduleItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + (i - 3));
      return date;
    });
  }, []);

  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })
    .format(today)
    .toUpperCase();

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);

      const dateString = selectedDate.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("task_date", dateString)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching tasks:", error);
      } else {
        setScheduleItems(data);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [selectedDate]);

  return (
    <div className="pb-32 px-6 space-y-8">
      <header className="pt-8">
        <p className="text-scholar-gold text-xs font-bold tracking-widest">
          {formattedDate}
        </p>
        <h2 className="text-4xl font-serif text-emerald-50 mt-2">
          Daily Schedule
        </h2>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
        {weekDays.map((date, i) => {
          const isSelected =
            date.toDateString() === selectedDate.toDateString();
          const dayName = date.toLocaleDateString("en-US", {
            weekday: "short",
          });
          const dayNum = date.getDate();

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(new Date(date))}
              className={`flex flex-col items-center p-4 rounded-3xl min-w-[70px] transition-all snap-center
              ${
                isSelected
                  ? "bg-orange-200 text-emerald-950 shadow-[0_0_20px_rgba(253,186,116,0.3)] scale-110"
                  : "bg-emerald-900/30 text-emerald-500"
              }`}
            >
              <span className="text-[10px] font-bold uppercase mb-1">
                {dayName}
              </span>
              <span className="text-xl font-bold">{dayNum}</span>
            </button>
          );
        })}
      </div>
      <div className="space-y-6 relative">
        <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-emerald-900/50 -z-10" />

        {scheduleItems.map((item) => (
          <div key={item.id} className="flex gap-6 items-start group">
            <div
              className={`mt-6 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 shrink-0
              ${item.isCurrent ? "bg-emerald-950 border-emerald-400 shadow-[0_0_10px_#34d399]" : "bg-emerald-900 border-emerald-800"}`}
            >
              {item.isCurrent ? (
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ) : (
                <CheckIcon size={10} className="text-emerald-800" />
              )}
            </div>

            <div
              className={`flex-1 p-6 rounded-[2rem] transition-all 
              ${item.isCurrent ? "bg-emerald-900/40 border border-emerald-500/30 shadow-xl" : "bg-emerald-900/20 border border-transparent"}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-scholar-gold text-[10px] font-bold">
                  {item.time_range}
                </span>
                {item.isCurrent && (
                  <span className="bg-orange-300/10 text-orange-300 text-[10px] px-3 py-1 rounded-full font-bold">
                    CURRENT
                  </span>
                )}
              </div>
              <h3 className="text-xl font-serif text-emerald-50 mb-1">
                {item.title}
              </h3>
              <p className="text-emerald-500/70 text-sm italic">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="fixed bottom-28 right-8 w-14 h-14 rounded-full bg-orange-300 text-emerald-950 flex items-center justify-center shadow-lg shadow-orange-300/20 active:scale-90 transition-transform">
        <PlusIcon size={24} strokeWidth={3} />
      </button>
    </div>
  );
}
