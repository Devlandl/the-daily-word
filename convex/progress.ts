import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByPlan = query({
  args: { planId: v.id("plans") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("progress")
      .withIndex("by_planId_userId", (q) =>
        q.eq("planId", args.planId).eq("userId", identity.subject)
      )
      .collect();
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("progress")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

export const toggleDay = mutation({
  args: {
    planId: v.id("plans"),
    dayNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const existing = await ctx.db
      .query("progress")
      .withIndex("by_planId_userId", (q) =>
        q.eq("planId", args.planId).eq("userId", userId)
      )
      .collect();

    const found = existing.find((p) => p.dayNumber === args.dayNumber);
    if (found) {
      await ctx.db.delete(found._id);
    } else {
      await ctx.db.insert("progress", {
        planId: args.planId,
        userId,
        dayNumber: args.dayNumber,
        completedAt: Date.now(),
      });
      const plan = await ctx.db.get(args.planId);
      if (plan && !plan.startedAt && plan.userId === userId) {
        await ctx.db.patch(args.planId, { startedAt: Date.now() });
      }
    }
  },
});
