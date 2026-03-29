import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByPlan = query({
  args: { planId: v.id("plans") },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("entries")
      .withIndex("by_planId", (q) => q.eq("planId", args.planId))
      .collect();
    return entries.sort((a, b) => a.dayNumber - b.dayNumber);
  },
});

export const createBatch = mutation({
  args: {
    planId: v.id("plans"),
    entries: v.array(
      v.object({
        dayNumber: v.number(),
        scripturePassage: v.string(),
        reflection: v.string(),
        thoughtQuestion: v.string(),
        prayerPrompt: v.string(),
        dailyChallenge: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    for (const entry of args.entries) {
      await ctx.db.insert("entries", {
        planId: args.planId,
        dayNumber: entry.dayNumber,
        scripturePassage: entry.scripturePassage,
        reflection: entry.reflection,
        thoughtQuestion: entry.thoughtQuestion,
        prayerPrompt: entry.prayerPrompt,
        dailyChallenge: entry.dailyChallenge,
      });
    }
  },
});
