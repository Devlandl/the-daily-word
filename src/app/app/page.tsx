"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";

const LENGTH_OPTIONS = [
  { value: 7, label: "7 Days" },
  { value: 14, label: "14 Days" },
  { value: 21, label: "21 Days" },
  { value: 30, label: "30 Days" },
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

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-brand-white">Create Reading Plan</h1>

      <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm text-brand-muted mb-2 block">
            Topic, verse, or book of the Bible
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder='e.g. gratitude, Psalm 23, the book of James'
            className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-lg text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-gold"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) handleGenerate();
            }}
          />
        </div>

        <div>
          <label className="text-sm text-brand-muted mb-2 block">Plan Length</label>
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
    </div>
  );
}
