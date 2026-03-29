"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function SharedPlanPage() {
  const params = useParams();
  const shareId = params.shareId as string;

  const plan = useQuery(api.plans.getByShareId, { shareId });
  const entries = useQuery(
    api.entries.listByPlan,
    plan ? { planId: plan._id } : "skip"
  );

  if (plan === undefined) {
    return (
      <div className="min-h-screen bg-brand-black p-4 md:p-6">
        <div className="max-w-3xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-brand-card rounded w-64" />
          <div className="h-48 bg-brand-card rounded" />
        </div>
      </div>
    );
  }

  if (plan === null) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl mb-4 block">📖</span>
          <p className="text-brand-muted mb-4">This plan was not found.</p>
          <Link href="/" className="text-brand-gold hover:text-brand-gold-light">Go to The Daily Word</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <span className="text-4xl mb-3 block">📖</span>
          <h1 className="text-3xl font-bold text-brand-white">{plan.title}</h1>
          <p className="text-brand-muted mt-2">{plan.length}-day devotional reading plan</p>
        </div>

        {entries && (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry._id} className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-brand-gold">Day {entry.dayNumber}</h2>
                <div>
                  <h3 className="text-xs text-brand-gold font-medium mb-1">📖 Scripture</h3>
                  <p className="text-sm text-brand-white">{entry.scripturePassage}</p>
                </div>
                <div>
                  <h3 className="text-xs text-brand-gold font-medium mb-1">💭 Reflection</h3>
                  <p className="text-sm text-brand-white whitespace-pre-wrap">{entry.reflection}</p>
                </div>
                <div>
                  <h3 className="text-xs text-brand-gold font-medium mb-1">❓ Thought Question</h3>
                  <p className="text-sm text-brand-white">{entry.thoughtQuestion}</p>
                </div>
                <div>
                  <h3 className="text-xs text-brand-gold font-medium mb-1">🙏 Prayer Prompt</h3>
                  <p className="text-sm text-brand-white">{entry.prayerPrompt}</p>
                </div>
                <div>
                  <h3 className="text-xs text-brand-gold font-medium mb-1">🎯 Daily Challenge</h3>
                  <p className="text-sm text-brand-white">{entry.dailyChallenge}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center py-8">
          <p className="text-brand-muted mb-4">Want to create your own reading plan?</p>
          <Link href="/sign-up" className="inline-block px-8 py-3 bg-brand-gold text-brand-black font-semibold rounded-xl hover:bg-brand-gold-light transition-colors">
            Create Your Own Plan - It&apos;s Free
          </Link>
        </div>

        <footer className="border-t border-brand-border py-6 text-center">
          <p className="text-brand-muted text-sm">
            <a href="https://thedailyword.tvrapp.app" className="text-brand-gold hover:text-brand-gold-light">The Daily Word</a> - A TVR App Store Product
          </p>
        </footer>
      </div>
    </div>
  );
}
