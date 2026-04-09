import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Sparkles, Check } from "lucide-react";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setTasks(data);
    setLoading(false);
  }

  async function toggleTask(id, currentStatus) {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, is_completed: !currentStatus } : t,
      ),
    );

    await supabase
      .from("tasks")
      .update({ is_completed: !currentStatus })
      .eq("id", id);
  }

  const remaining = tasks.filter((t) => !t.is_completed).length;

  if (loading)
    return <div className="p-10 text-emerald-500">Unlocking Vault...</div>;

  return (
    <div className="py-6 space-y-8">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-serif text-emerald-50">Today's Vault</h2>
        <span className="text-scholar-gold font-bold">
          {remaining} Tasks Left
        </span>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id, task.is_completed)}
            className="flex items-center gap-4 p-5 rounded-2xl bg-[#062016] border border-white/5 active:scale-95 transition-all cursor-pointer"
          >
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center 
              ${task.is_completed ? "bg-emerald-500 border-emerald-500" : "border-emerald-500/20"}`}
            >
              {task.is_completed && (
                <Check size={14} className="text-[#04160e]" strokeWidth={3} />
              )}
            </div>
            <p
              className={
                task.is_completed
                  ? "text-emerald-500/40 line-through"
                  : "text-emerald-50"
              }
            >
              {task.title || "Untitled Manuscript"}
            </p>
          </div>
        ))}
      </div>
      <div
        onClick={() => navigate("/generator")}
        className="fixed bottom-24 left-0 right-0 px-6 z-50"
      >
        <button className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-orange-300 text-emerald-950 font-bold shadow-lg shadow-orange-300/20 active:scale-95 transition-transform">
          <Sparkles size={18} />
          GENERATE MY PLAN
        </button>
      </div>
    </div>
  );
}
