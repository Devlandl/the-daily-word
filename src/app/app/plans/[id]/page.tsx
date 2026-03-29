"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate, calculateStreak } from "@/lib/utils";

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as Id<"plans">;

  const plan = useQuery(api.plans.getById, { planId });
  const entries = useQuery(api.entries.listByPlan, { planId });
  const progressData = useQuery(api.progress.listByPlan, { planId });

  const toggleDay = useMutation(api.progress.toggleDay);
  const genShareId = useMutation(api.plans.generateShareId);
  const removePlan = useMutation(api.plans.remove);

  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  if (plan === undefined || entries === undefined || progressData === undefined) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-brand-card rounded w-64" />
          <div className="h-48 bg-brand-card rounded" />
        </div>
      </div>
    );
  }

  if (plan === null) {
    return (
      <div className="p-4 md:p-6 text-center py-16">
        <p className="text-brand-muted">Plan not found.</p>
        <Link href="/app/plans" className="text-brand-gold text-sm mt-2 inline-block">
          Back to My Plans
        </Link>
      </div>
    );
  }

  const completedDays = new Set(progressData.map((p) => p.dayNumber));
  const completedCount = completedDays.size;
  const progressPercent = Math.round((completedCount / plan.length) * 100);
  const streak = calculateStreak(progressData);

  const currentDay =
    entries.find((e) => !completedDays.has(e.dayNumber))?.dayNumber || plan.length;

  async function handleToggle(dayNumber: number) {
    await toggleDay({ planId, dayNumber });
  }

  async function handleShare() {
    const id = await genShareId({ planId });
    const link = `${window.location.origin}/plan/${id}`;
    setShareLink(link);
    await navigator.clipboard.writeText(link);
  }

  async function handleDelete() {
    await removePlan({ planId });
    router.push("/app/plans");
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <Link href="/app/plans" className="text-brand-muted text-sm hover:text-brand-gold transition-colors">
        &larr; Back to My Plans
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-brand-white">{plan.title}</h1>
        <p className="text-sm text-brand-muted mt-1">{plan.length} days - Created {formatDate(plan.createdAt)}</p>
      </div>

      <div className="flex gap-3">
        {streak > 0 && (
          <div className="bg-brand-card border border-brand-border rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <div>
              <p className="text-lg font-bold text-brand-gold">{streak}</p>
              <p className="text-xs text-brand-muted">day streak</p>
            </div>
          </div>
        )}
        <div className="flex-1 bg-brand-card border border-brand-border rounded-xl px-4 py-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-brand-muted">Progress</span>
            <span className="text-brand-white">{completedCount}/{plan.length} days ({progressPercent}%)</span>
          </div>
          <div className="w-full h-3 bg-brand-border rounded-full overflow-hidden">
            <div className="h-full bg-brand-gold rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={handleShare} className="px-4 py-2 bg-brand-dark border border-brand-border rounded-lg text-sm text-brand-white hover:border-brand-gold/30 transition-colors">
          {shareLink ? "Link Copied!" : "Share Plan"}
        </button>
        <button onClick={() => setShowDelete(!showDelete)} className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 hover:bg-red-500/20 transition-colors">
          Delete
        </button>
      </div>

      {showDelete && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <p className="text-red-400 text-sm">Are you sure? This cannot be undone.</p>
          <div className="flex gap-2">
            <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium">Yes, Delete</button>
            <button onClick={() => setShowDelete(false)} className="px-4 py-2 bg-brand-dark text-brand-muted border border-brand-border rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {entries.map((entry) => {
          const isCompleted = completedDays.has(entry.dayNumber);
          const isCurrent = entry.dayNumber === currentDay;
          const isExpanded = expandedDay === entry.dayNumber;

          return (
            <div key={entry._id} className={`bg-brand-card border rounded-xl overflow-hidden transition-colors ${isCurrent ? "border-brand-gold/50" : isCompleted ? "border-brand-border opacity-75" : "border-brand-border"}`}>
              <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedDay(isExpanded ? null : entry.dayNumber)}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(entry.dayNumber); }}
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isCompleted ? "bg-brand-gold border-brand-gold text-brand-black" : "border-brand-border hover:border-brand-gold"}`}
                >
                  {isCompleted && <span className="text-xs font-bold">&#10003;</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-white">
                    Day {entry.dayNumber}
                    {isCurrent && <span className="ml-2 text-xs text-brand-gold">Current</span>}
                  </p>
                  <p className="text-xs text-brand-muted truncate">{entry.scripturePassage}</p>
                </div>
                <span className="text-brand-muted text-sm">{isExpanded ? "▲" : "▼"}</span>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-brand-border pt-4">
                  <div>
                    <h4 className="text-xs text-brand-gold font-medium mb-1">📖 Scripture</h4>
                    <p className="text-sm text-brand-white">{entry.scripturePassage}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-brand-gold font-medium mb-1">💭 Reflection</h4>
                    <p className="text-sm text-brand-white whitespace-pre-wrap">{entry.reflection}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-brand-gold font-medium mb-1">❓ Thought Question</h4>
                    <p className="text-sm text-brand-white">{entry.thoughtQuestion}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-brand-gold font-medium mb-1">🙏 Prayer Prompt</h4>
                    <p className="text-sm text-brand-white">{entry.prayerPrompt}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-brand-gold font-medium mb-1">🎯 Daily Challenge</h4>
                    <p className="text-sm text-brand-white">{entry.dailyChallenge}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
