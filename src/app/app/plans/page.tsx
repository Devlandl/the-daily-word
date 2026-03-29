"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import EmptyState from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

export default function PlansPage() {
  const plans = useQuery(api.plans.list);

  if (!plans) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-brand-card rounded w-48" />
          <div className="h-32 bg-brand-card rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-brand-white">My Plans</h1>

      {plans.length === 0 ? (
        <EmptyState
          emoji="📖"
          title="No plans yet"
          description="Create your first devotional reading plan."
          action={{ label: "Create Plan", href: "/app" }}
        />
      ) : (
        <div className="space-y-2">
          {plans.map((plan) => (
            <Link
              key={plan._id}
              href={`/app/plans/${plan._id}`}
              className="flex items-center gap-3 bg-brand-card border border-brand-border rounded-xl p-4 hover:border-brand-gold/30 transition-colors"
            >
              <span className="text-2xl flex-shrink-0">📖</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-brand-white truncate">{plan.title}</p>
                <p className="text-xs text-brand-muted">{plan.length} days - {formatDate(plan.createdAt)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm text-brand-gold font-medium">
                  {plan.startedAt ? "In Progress" : "Not Started"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
