import { CheckIcon, PlusIcon, Save, XCircleIcon } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Schedule() {
  const [scheduleItems, setScheduleItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    desc: "",
    task_date: selectedDate.toISOString().split("T")[0],
    startTime: "00:00",
    endTime: "00:00",
    category: "General",
  });

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
        setScheduleItems(data || []);
      }
      setLoading(false);
    };
    fetchTasks();
  }, [selectedDate]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.startTime || !newTask.endTime) return;
    setLoading(true);

    try {
      const startISO = new Date(
        `${newTask.task_date}T${newTask.startTime}:00`,
      ).toISOString();
      const endISO = new Date(
        `${newTask.task_date}T${newTask.endTime}:00`,
      ).toISOString();

      // Calculate duration for the progress bar
      const diffMs = new Date(endISO) - new Date(startISO);
      const totalMinutes = Math.floor(diffMs / 60000);

      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            title: newTask.title,
            desc: newTask.desc,
            start_time: startISO,
            end_time: endISO,
            total_minutes: totalMinutes,
            category: newTask.category,
            task_date: newTask.task_date,
            time_range: `${newTask.startTime} - ${newTask.endTime}`,
          },
        ])
        .select();

      if (error) throw error;

      setScheduleItems((prev) => [...prev, data[0]]);
      setShowModal(false);
      setNewTask({ ...newTask, title: "", desc: "" });
    } catch (error) {
      console.error("Save failed:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-32 px-6 space-y-8 relative">
      <header className="pt-8">
        <p className="text-scholar-gold text-xs font-bold tracking-widest">
          {formattedDate}
        </p>
        <h2 className="text-4xl font-scholar text-emerald-50 mt-2">
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
              ${isSelected ? "bg-orange-200 text-emerald-950 scale-110" : "bg-emerald-900/30 text-emerald-500"}`}
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
              <h3 className="text-xl font-scholar text-emerald-50 mb-1">
                {item.title}
              </h3>
              <p className="text-emerald-500/70 text-sm italic">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-28 right-8 w-14 h-14 rounded-full bg-orange-300 text-emerald-950 flex items-center justify-center z-40"
      >
        <PlusIcon size={24} strokeWidth={3} />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#04160e] rounded-t-[3rem] p-8 pb-12 space-y-6 animate-in slide-in-from-bottom duration-300 border-t border-emerald-500/20">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-scholar text-emerald-50">
                Add New Schedulr Task
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-emerald-500/50 hover:text-emerald-500"
              >
                <XCircleIcon size={28} />
              </button>
            </div>

            <form className="space-y-5">
              <div>
                <label className="block text-scholar-gold font-noto text-[10px] font-bold tracking-widest uppercase mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="e.g. Watch videos on AI"
                  className="bg-emerald-900/20 border border-emerald-800 focus:border-orange-300 rounded-2xl px-4 py-3 w-full text-emerald-50 outline-none"
                />
              </div>

              <div>
                <label className="block text-scholar-gold font-noto text-[10px] font-bold tracking-widest uppercase mb-2">
                  Curator's Notes
                </label>
                <textarea
                  value={newTask.desc}
                  onChange={(e) =>
                    setNewTask({ ...newTask, desc: e.target.value })
                  }
                  placeholder="Brief details about your objective..."
                  className="bg-emerald-900/20 border border-emerald-800 focus:border-orange-300 rounded-2xl px-4 py-3 w-full text-emerald-50 min-h-[100px] outline-none resize-none font-noto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-scholar-gold font-noto text-[10px] font-bold tracking-widest uppercase mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={newTask.task_date}
                    onChange={(e) =>
                      setNewTask({ ...newTask, task_date: e.target.value })
                    }
                    className="bg-emerald-900/20 border border-emerald-800 focus:border-orange-300 rounded-2xl px-4 py-3 w-full text-emerald-50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-scholar-gold font-noto text-[10px] font-bold tracking-widest uppercase mb-2">
                    Hours
                  </label>
                  <input
                    type="text"
                    value={newTask.time_range}
                    onChange={(e) => {
                      const val = e.target.value;
                      const parts = val.split("-").map((t) => t.trim());
                      setNewTask({
                        ...newTask,
                        time_range: val,
                        startTime: parts[0] || "00:00",
                        endTime: parts[1] || "00:00",
                      });
                    }}
                    placeholder="08:00 - 10:00"
                    className="bg-emerald-900/20 border border-emerald-800 focus:border-orange-300 rounded-2xl px-4 py-3 w-full text-emerald-50 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-orange-300 text-emerald-950 font-bold text-lg active:scale-95 transition-all disabled:opacity-50"
              >
                <Save size={20} />
                <span>{loading ? "Archiving..." : "Save Task"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
