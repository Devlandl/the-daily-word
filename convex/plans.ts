import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    const plans = await ctx.db
      .query("plans")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return plans.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getById = query({
  args: { planId: v.id("plans") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const plan = await ctx.db.get(args.planId);
    if (!plan || plan.userId !== identity.subject) return null;
    return plan;
  },
});

export const getByShareId = query({
  args: { shareId: v.string() },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("plans")
      .withIndex("by_shareId", (q) => q.eq("shareId", args.shareId))
      .first();
    return plan;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    topic: v.string(),
    length: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("plans", {
      userId: identity.subject,
      title: args.title,
      topic: args.topic,
      length: args.length,
      shareId: undefined,
      startedAt: undefined,
      createdAt: Date.now(),
    });
  },
});

export const generateShareId = mutation({
  args: { planId: v.id("plans") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const plan = await ctx.db.get(args.planId);
    if (!plan || plan.userId !== identity.subject)
      throw new Error("Not found");
    if (plan.shareId) return plan.shareId;
    const shareId =
      Math.random().toString(36).substring(2, 10) +
      Math.random().toString(36).substring(2, 10);
    await ctx.db.patch(args.planId, { shareId });
    return shareId;
  },
});

export const remove = mutation({
  args: { planId: v.id("plans") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const plan = await ctx.db.get(args.planId);
    if (!plan || plan.userId !== identity.subject)
      throw new Error("Not found");
    const entries = await ctx.db
      .query("entries")
      .withIndex("by_planId", (q) => q.eq("planId", args.planId))
      .collect();
    for (const entry of entries) {
      await ctx.db.delete(entry._id);
    }
    const progress = await ctx.db
      .query("progress")
      .withIndex("by_planId_userId", (q) =>
        q.eq("planId", args.planId).eq("userId", identity.subject)
      )
      .collect();
    for (const p of progress) {
      await ctx.db.delete(p._id);
    }
    await ctx.db.delete(args.planId);
  },
});
