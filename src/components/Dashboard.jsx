import { Sparkles, Check } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const [tasks, setTasks] = useState([
    { id: 1, completed: false },
    { id: 2, completed: false },
    { id: 3, completed: false },
  ]);

  const remaining = tasks.filter((t) => !t.completed).length;

  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  return (
    <div className="py-6 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-emerald-300/60 text-xs uppercase tracking-widest">
            Curator Intelligence
          </p>
          <h2 className="text-2xl font-serif text-emerald-50">Today's Vault</h2>
        </div>
        <div className="text-right">
          <span className="text-scholar-gold text-lg font-bold">
            {remaining}
          </span>
          <p className="text-[10px] text-emerald-500/50 uppercase">Remaining</p>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className="flex items-center gap-4 p-5 rounded-2xl bg-[#062016] border border-white/5 cursor-pointer active:scale-95 transition-transform"
          >
            <div
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors
              ${task.completed ? "bg-emerald-500 border-emerald-500" : "border-emerald-500/20"}`}
            >
              {task.completed && (
                <Check size={16} className="text-[#04160e]" strokeWidth={3} />
              )}
            </div>

            <div className="h-2 w-32 bg-emerald-900/30 rounded-full" />
          </div>
        ))}
      </div>

      <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#fbbd71] text-[#04160e] font-bold shadow-lg shadow-orange-950/20">
        <Sparkles size={18} />
        GENERATE MY PLAN
      </button>
    </div>
  );
}
