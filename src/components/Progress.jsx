import { Flame, Lightbulb, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export const useCurrentTask = () => {
  const [activeTask, setActiveTask] = useState(null);
  const [progress, setProgress] = useState(0);
  const [dayStreak, setDayStreak] = useState(0);
  const [velocity, setVelocity] = useState(0);

  const calculateStreakLogic = (dates) => {
    if (dates.length === 0) return 0;

    let streak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);

    // If no task finished today, check if one was finished yesterday to keep streak alive
    if (dates[0] !== checkDate.toISOString().split("T")[0]) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    for (let i = 0; i < dates.length; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (dates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  // Logic to calculate focus velocity compared to last week(For motivation purposes😌)
  const calculateFocusVelocity = async () => {
    const today = new Date();
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(today.getDate() - 14);

    const { data, error } = await supabase
      .from("tasks")
      .select("task_date")
      .eq("is_completed", true)
      .gte("task_date", lastWeekStart.toISOString().split("T")[0]);

    if (data) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);

      const thisWeekTasks = data.filter(
        (t) => new Date(t.task_date) >= oneWeekAgo,
      ).length;
      const lastWeekTasks = data.filter(
        (t) => new Date(t.task_date) < oneWeekAgo,
      ).length;

      if (lastWeekTasks === 0) return thisWeekTasks > 0 ? 100 : 0;
      const velocity = ((thisWeekTasks - lastWeekTasks) / lastWeekTasks) * 100;

      return Math.round(velocity);
    }
    return 0;
  };

  useEffect(() => {
    const fetchProgressData = async () => {
      const now = new Date().toISOString();

      const { data: taskData } = await supabase
        .from("tasks")
        .select("*")
        .lte("start_time", now)
        .gte("end_time", now)
        .single();

      if (taskData) {
        setActiveTask(taskData);
        const start = new Date(taskData.start_time);
        const end = new Date(taskData.end_time);
        const elapsed = new Date() - start;
        setProgress(Math.min(Math.floor((elapsed / (end - start)) * 100), 100));
      } else {
        setActiveTask(null);
        setProgress(0);
      }

      const { data: streakData } = await supabase
        .from("tasks")
        .select("task_date")
        .eq("is_completed", true)
        .order("task_date", { ascending: false });

      if (streakData) {
        const uniqueDates = [
          ...new Set(streakData.map((item) => item.task_date)),
        ];
        setDayStreak(calculateStreakLogic(uniqueDates));
      }

      const velocityValue = await calculateFocusVelocity();
      setVelocity(velocityValue);
    };

    fetchProgressData();
    const interval = setInterval(fetchProgressData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { activeTask, progress, dayStreak, velocity };
};

const ProgressCircle = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = "#34d399",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(6, 78, 59, 0.3)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-in-out"
        />
      </svg>
      <span className="absolute text-2xl font-bold text-emerald-50">
        {percentage}%
      </span>
    </div>
  );
};

export default function Progress() {
  const { activeTask, progress, dayStreak, velocity } = useCurrentTask();

  const statusText = velocity >= 0 ? "Excellent" : "Needs Focus";
  const velocityColor = velocity >= 0 ? "text-emerald-400" : "text-orange-400";
  const bgColor = velocity >= 0 ? "bg-emerald-400/10" : "bg-orange-400/10";

  return (
    <div className="pb-32 px-6 space-y-8 relative pt-8">
      <section>
        <h2 className="text-scholar-gold text-[10px] font-bold tracking-widest uppercase mb-2">
          CONSISTENCY
        </h2>
        <div className="flex justify-between items-end mb-4">
          <p className="text-4xl font-scholar text-emerald-50 italic">
            {dayStreak} Day Streak
          </p>
          <div className="relative w-12 h-12 rounded-full border border-orange-400/50 flex items-center justify-center bg-orange-400/10">
            <Flame size={24} className="text-orange-400 fill-orange-400" />
          </div>
        </div>
        <div className="w-full h-1 bg-emerald-900/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${Math.min((dayStreak / 7) * 100, 100)}%` }}
          />
        </div>
      </section>

      <div className="p-6 rounded-[2rem] bg-emerald-900/20 border border-emerald-500/20">
        <div className="flex gap-4 items-start">
          <Lightbulb size={20} className="text-orange-400 mt-1" />
          <p className="text-emerald-50/70 text-xs italic leading-relaxed">
            {activeTask
              ? `You're currently in your "${activeTask.title}" session. Keep going, you've completed ${progress}% of the allocated time!`
              : "No active task right now. Check your schedule to see what's next!"}
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-scholar-gold text-[10px] font-bold tracking-widest uppercase">
          SESSION PROGRESS
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 rounded-[2.5rem] bg-emerald-900/20 border border-emerald-500/10 p-8 flex flex-col items-center">
            <ProgressCircle percentage={progress} size={150} />
            <h3 className="mt-6 text-xl font-scholar text-emerald-50">
              {activeTask ? activeTask.title : "Idle"}
            </h3>
            <p className="text-emerald-500/50 text-xs mt-1">
              {activeTask ? activeTask.time_range : "Waiting for next task"}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-scholar-gold text-[10px] font-bold tracking-widest uppercase">
          FOCUS VELOCITY
        </h2>
        <div className="w-full rounded-[2.5rem] bg-emerald-900/20 border border-emerald-500/10 p-8 flex justify-between items-center">
          <div>
            <p className={`text-3xl font-scholar ${velocityColor}`}>
              {statusText}
            </p>
            <div className="flex gap-2 mt-2">
              <span
                className={`text-[10px] ${bgColor} ${velocityColor} px-2 py-1 rounded-full`}
              >
                {velocity >= 0 ? `+${velocity}%` : `${velocity}%`} vs Last Week
              </span>
            </div>
          </div>
          <TrendingUp size={48} className={`${velocityColor} opacity-20`} />
        </div>
      </section>
    </div>
  );
}
