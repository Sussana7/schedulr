import { useState, useEffect } from "react";
import {
  SparklesIcon,
  AlertTriangleIcon,
  ClockIcon,
  LightbulbIcon,
  RefreshCwIcon,
} from "lucide-react";
import { supabase } from "../supabaseClient";

const callGemini = async (prompt) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

const parseGeminiJSON = (text) => {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

const priorityStyles = {
  HIGH: "bg-red-900/40 text-red-400 border border-red-500/30",
  MEDIUM: "bg-amber-900/40 text-amber-400 border border-amber-500/30",
  LOW: "bg-emerald-900/40 text-emerald-500 border border-emerald-500/20",
};

const riskStyles = {
  HIGH: "bg-red-900/60 text-red-300 border border-red-500/40",
  MEDIUM: "bg-amber-900/60 text-amber-300 border border-amber-500/40",
  LOW: "bg-emerald-900/60 text-emerald-300 border border-emerald-500/40",
};

export default function Generator() {
  const [tasks, setTasks] = useState([]);
  const [plan, setPlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoadingTasks(true);
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .gte("task_date", today)
        .eq("is_completed", false)
        .order("task_date", { ascending: true });

      if (error) {
        console.error("Error fetching tasks:", error);
      } else {
        setTasks(data || []);
      }
      setLoadingTasks(false);
    };

    fetchTasks();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const overdueTasks = tasks.filter((t) => t.task_date < today);
  const pendingCount = tasks.length;
  const overdueCount = overdueTasks.length;

  const riskLevel =
    overdueCount >= 3 ? "HIGH" : overdueCount >= 1 ? "MEDIUM" : "LOW";

  const handleGenerate = async () => {
    if (tasks.length === 0) {
      setError("No tasks found. Add some tasks in your schedule first!");
      return;
    }

    setGenerating(true);
    setError("");
    setPlan(null);

    try {
      const taskList = tasks
        .map(
          (t, i) =>
            `${i + 1}. Title: "${t.title}" | Date: ${t.task_date} | Time: ${t.time_range || "Not set"} | Category: ${t.category || "General"} | Notes: ${t.desc || "None"}`,
        )
        .join("\n");

      const todayFormatted = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });


      const prompt = `
You are an expert academic study planner AI called "Curator Intelligence" for a student productivity app called Schedulr.

Today is ${todayFormatted}.

The student has the following pending tasks:
${taskList}

Your job is to analyze these tasks and create an optimized study plan. 

Rules for prioritization:
- Tasks due TODAY or OVERDUE (past today) = HIGH priority
- Tasks due within 3 days = MEDIUM priority  
- Tasks due further away = LOW priority
- Tasks with shorter time_range or more complex descriptions should be flagged

Respond ONLY with a valid JSON object in this exact format, no extra text, no markdown:
{
  "prioritizedTasks": [
    {
      "title": "task title here",
      "priority": "HIGH" or "MEDIUM" or "LOW",
      "timeBlock": "suggested time block e.g. 08:00 - 10:00",
      "isOverdue": true or false,
      "category": "category name",
      "reason": "one short sentence why this priority"
    }
  ],
  "curatorTip": "One actionable study tip based on their specific tasks. Be specific, mention actual task names. Max 2 sentences.",
  "riskSummary": "One sentence summarizing the student's academic risk level today."
}
      `;

      const rawResponse = await callGemini(prompt);
      console.log("Gemini raw response:", rawResponse);

      const parsed = parseGeminiJSON(rawResponse);

      if (!parsed) {
        throw new Error("Could not parse Gemini response. Try again.");
      }

      setPlan(parsed);
    } catch (err) {
      console.error("Generation error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="pb-32 px-6 space-y-6">
      <header className="pt-8 flex items-center justify-between">
        <div>
          <p className="text-[#fbbd71] text-[10px] font-bold tracking-widest uppercase font-sans">
            Curator Intelligence
          </p>
          <h2 className="text-3xl font-serif text-emerald-50 mt-1">
            AI Planner
          </h2>
        </div>
        <SparklesIcon size={24} className="text-[#fbbd71]" />
      </header>

      <div className="bg-emerald-950/60 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute right-4 bottom-0 flex items-end gap-1 opacity-10">
          {[40, 60, 35, 80, 55, 70, 45].map((h, i) => (
            <div
              key={i}
              className="w-3 bg-emerald-400 rounded-t"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>

        <p className="text-emerald-500 text-[10px] uppercase tracking-widest font-sans mb-2">
          Current Analysis
        </p>

        <div className="flex items-start justify-between">
          <div>
            {loadingTasks ? (
              <p className="text-emerald-400 text-lg animate-pulse">
                Loading vault...
              </p>
            ) : (
              <>
                <h3 className="text-4xl font-serif text-emerald-50 font-bold leading-tight">
                  {pendingCount} task{pendingCount !== 1 ? "s" : ""}
                </h3>
                <p className="text-emerald-50 text-xl font-serif">pending</p>
              </>
            )}

            {overdueCount > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <AlertTriangleIcon size={14} className="text-amber-400" />
                <span className="text-amber-400 text-xs font-sans">
                  {overdueCount} overdue assignment
                  {overdueCount !== 1 ? "s" : ""} detected
                </span>
              </div>
            )}

            {overdueCount === 0 && !loadingTasks && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-emerald-500 text-xs font-sans">
                  ✓ No overdue assignments
                </span>
              </div>
            )}
          </div>

          <span
            className={`text-xs font-bold tracking-widest px-3 py-2 rounded-xl font-sans ${riskStyles[riskLevel]}`}
          >
            {riskLevel}
            <br />
            RISK
          </span>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={generating || loadingTasks || tasks.length === 0}
        className="w-full bg-[#fbbd71] hover:bg-[#fbbd71]/90 text-[#04160e] font-bold py-5 rounded-2xl flex items-center justify-center gap-3 font-sans tracking-wider transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? (
          <>
            <RefreshCwIcon size={20} className="animate-spin" />
            ANALYZING YOUR VAULT...
          </>
        ) : (
          <>
            <SparklesIcon size={20} />
            GENERATE MY PLAN
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-2xl px-4 py-3 text-red-300 text-xs font-sans">
          {error}
        </div>
      )}

      {plan && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif text-emerald-50">
              Strategized Path
            </h3>
            <span className="text-[#fbbd71] text-[10px] font-sans tracking-widest uppercase">
              Priority Flow
            </span>
          </div>

          {plan.prioritizedTasks?.map((task, i) => (
            <div
              key={i}
              className="bg-emerald-950/50 border border-white/5 rounded-3xl p-6 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full font-sans ${priorityStyles[task.priority] || priorityStyles.LOW}`}
                >
                  {task.priority} PRIORITY
                </span>

                {task.isOverdue && (
                  <div className="flex items-center gap-1 text-amber-400">
                    <ClockIcon size={12} />
                    <span className="text-[10px] font-bold tracking-widest font-sans">
                      OVERDUE
                    </span>
                  </div>
                )}
              </div>

              <h4 className="text-xl font-serif text-emerald-50">
                {task.title}
              </h4>

              <div className="flex items-center gap-4 text-emerald-500 text-xs font-sans">
                {task.timeBlock && (
                  <div className="flex items-center gap-1">
                    <ClockIcon size={12} />
                    <span>{task.timeBlock}</span>
                  </div>
                )}
                {task.category && (
                  <span className="text-emerald-700">• {task.category}</span>
                )}
              </div>

              {task.reason && (
                <p className="text-emerald-600 text-xs font-sans italic">
                  {task.reason}
                </p>
              )}
            </div>
          ))}

          {plan.curatorTip && (
            <div className="bg-emerald-900/30 border border-[#fbbd71]/20 rounded-3xl p-6 flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#fbbd71]/20 flex items-center justify-center shrink-0">
                <LightbulbIcon size={18} className="text-[#fbbd71]" />
              </div>
              <div>
                <p className="text-[#fbbd71] text-[10px] font-bold tracking-widest uppercase font-sans mb-2">
                  Curator's Tip
                </p>
                <p className="text-emerald-200 text-sm font-sans leading-relaxed">
                  {plan.curatorTip}
                </p>
              </div>
            </div>
          )}

          {plan.riskSummary && (
            <div className="bg-emerald-950/40 border border-white/5 rounded-2xl px-5 py-4">
              <p className="text-emerald-500 text-xs font-sans italic text-center">
                {plan.riskSummary}
              </p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="w-full border border-emerald-800 text-emerald-600 text-xs font-sans tracking-widest uppercase py-4 rounded-2xl hover:border-[#fbbd71]/40 hover:text-[#fbbd71] transition-all"
          >
            Regenerate Plan
          </button>
        </div>
      )}

      {!loadingTasks && tasks.length === 0 && !plan && (
        <div className="text-center py-12 space-y-3">
          <SparklesIcon size={32} className="text-emerald-800 mx-auto" />
          <p className="text-emerald-700 font-sans text-sm">
            Your vault is empty.
          </p>
          <p className="text-emerald-800 font-sans text-xs">
            Add tasks in your Schedule first, then come back to generate your
            plan.
          </p>
        </div>
      )}
    </div>
  );
}
