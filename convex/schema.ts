import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  plans: defineTable({
    userId: v.string(),
    title: v.string(),
    topic: v.string(),
    length: v.number(),
    shareId: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_shareId", ["shareId"]),

  entries: defineTable({
    planId: v.id("plans"),
    dayNumber: v.number(),
    scripturePassage: v.string(),
    reflection: v.string(),
    thoughtQuestion: v.string(),
    prayerPrompt: v.string(),
    dailyChallenge: v.string(),
  }).index("by_planId", ["planId"]),

  progress: defineTable({
    planId: v.id("plans"),
    userId: v.string(),
    dayNumber: v.number(),
    completedAt: v.number(),
  })
    .index("by_planId_userId", ["planId", "userId"])
    .index("by_userId", ["userId"]),
});
