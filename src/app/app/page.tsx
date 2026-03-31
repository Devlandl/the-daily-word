"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";

const LENGTH_OPTIONS = [
  { value: 7, label: "7 Days" },
  { value: 14, label: "14 Days" },
  { value: 21, label: "21 Days" },
  { value: 30, label: "30 Days" },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Pick a Topic",
    description: "Choose a Bible verse, book, or theme for your plan",
  },
  {
    step: 2,
    title: "Set Your Pace",
    description: "Pick a plan length from 7 to 30 days",
  },
  {
    step: 3,
    title: "Read Daily",
    description: "Get scripture, reflections, and prayer prompts each day",
  },
];

export default function CreatePlanPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [length, setLength] = useState(7);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const createPlan = useMutation(api.plans.create);
  const createEntries = useMutation(api.entries.createBatch);

  const plans = useQuery(api.plans.list);
  const allProgress = useQuery(api.progress.listMine);

  const stats = useMemo(() => {
    const planCount = plans?.length ?? 0;
    const daysCompleted = allProgress?.length ?? 0;
    const activePlans =
      plans?.filter((p) => {
        const completedDays =
          allProgress?.filter((pr) => pr.planId === p._id).length ?? 0;
        return p.startedAt && completedDays < p.length;
      }).length ?? 0;
    const topicsExplored = new Set(plans?.map((p) => p.topic) ?? []).size;
    return { planCount, daysCompleted, activePlans, topicsExplored };
  }, [plans, allProgress]);

  async function generateChunk(
    topicStr: string,
    totalLength: number,
    startDay: number,
    endDay: number,
    priorSummary?: string
  ) {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: topicStr,
        length: totalLength,
        startDay,
        endDay,
        priorSummary,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to generate");
    }

    return await res.json();
  }

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    setProgress("Creating your reading plan...");

    try {
      const chunks: { start: number; end: number }[] = [];
      if (length <= 14) {
        chunks.push({ start: 1, end: length });
      } else {
        for (let i = 1; i <= length; i += 7) {
          chunks.push({ start: i, end: Math.min(i + 6, length) });
        }
      }

      let allEntries: Array<{
        dayNumber: number;
        scripturePassage: string;
        reflection: string;
        thoughtQuestion: string;
        prayerPrompt: string;
        dailyChallenge: string;
      }> = [];
      let title = "";
      let summary = "";

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        setProgress(
          `Generating days ${chunk.start}-${chunk.end} of ${length}...`
        );

        const result = await generateChunk(
          topic.trim(),
          length,
          chunk.start,
          chunk.end,
          summary || undefined
        );

        allEntries = [...allEntries, ...result.entries];
        summary = result.summary || summary;

        if (i === 0 && result.entries.length > 0) {
          title = `${topic.trim()} - ${length} Day Plan`;
        }
      }

      setProgress("Saving your plan...");

      const planId = await createPlan({
        title,
        topic: topic.trim(),
        length,
      });

      await createEntries({
        planId,
        entries: allEntries,
      });

      router.push(`/app/plans/${planId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const statCards = [
    { label: "Plans Created", value: stats.planCount },
    { label: "Days Completed", value: stats.daysCompleted },
    { label: "Active Plans", value: stats.activePlans },
    { label: "Topics Explored", value: stats.topicsExplored },
  ];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-white">
          Welcome to The Daily Word
        </h1>
        <p className="text-brand-muted mt-1">
          AI-powered devotional reading plans for your spiritual journey
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-brand-card border border-brand-border rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-bold text-brand-gold">{card.value}</p>
            <p className="text-xs text-brand-muted mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Create Plan Form */}
      <div>
        <h2 className="text-lg font-semibold text-brand-white mb-3">
          Create Reading Plan
        </h2>
        <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-4">
          <div>
            <label className="text-sm text-brand-muted mb-2 block">
              Topic, verse, or book of the Bible
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. gratitude, Psalm 23, the book of James"
              className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-lg text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-gold"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) handleGenerate();
              }}
            />
          </div>

          <div>
            <label className="text-sm text-brand-muted mb-2 block">
              Plan Length
            </label>
            <div className="flex gap-2">
              {LENGTH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLength(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    length === opt.value
                      ? "bg-brand-gold text-brand-black"
                      : "bg-brand-dark text-brand-muted border border-brand-border hover:text-brand-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full py-3 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-brand-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generating..." : "Create Reading Plan"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block animate-pulse">📖</span>
          <p className="text-brand-muted">{progress}</p>
        </div>
      )}

      {/* How It Works */}
      <div>
        <h2 className="text-lg font-semibold text-brand-white mb-4">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className="bg-brand-card border border-brand-border rounded-xl p-5 flex flex-col items-center text-center"
            >
              <div className="w-10 h-10 rounded-full bg-brand-gold/15 border border-brand-gold/40 flex items-center justify-center mb-3">
                <span className="text-brand-gold font-bold text-sm">
                  {item.step}
                </span>
              </div>
              <h3 className="text-brand-white font-medium mb-1">
                {item.title}
              </h3>
              <p className="text-brand-muted text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
