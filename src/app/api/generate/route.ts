import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topic, length, startDay, endDay, priorSummary } = await req.json();

  if (!topic) {
    return NextResponse.json({ error: "Please provide a topic, verse, or book" }, { status: 400 });
  }

  if (![7, 14, 21, 30].includes(length)) {
    return NextResponse.json({ error: "Invalid plan length" }, { status: 400 });
  }

  const actualStart = startDay || 1;
  const actualEnd = endDay || length;

  const continuityContext = priorSummary
    ? `\n\nPrevious days covered: ${priorSummary}\nContinue building on those themes. Do not repeat scripture passages already used.`
    : "";

  const prompt = `You are a devotional reading plan creator. Create days ${actualStart} through ${actualEnd} of a ${length}-day devotional reading plan.

Topic/Verse/Book: ${topic}${continuityContext}

For each day, provide:
1. Scripture Passage - specific Bible verse(s) to read
2. Reflection - a 2-3 paragraph devotional reflection on the passage
3. Thought Question - one question to reflect on throughout the day
4. Prayer Prompt - a 2-3 sentence guided prayer
5. Daily Challenge - one practical action step

Respond with ONLY valid JSON in this exact format (no markdown, no code fences):
{
  "entries": [
    {
      "dayNumber": ${actualStart},
      "scripturePassage": "Book Chapter:Verses",
      "reflection": "The devotional reflection text...",
      "thoughtQuestion": "A reflective question...",
      "prayerPrompt": "Lord, help me to...",
      "dailyChallenge": "Today, try to..."
    }
  ],
  "summary": "Brief 1-sentence summary of themes covered in these days"
}

Generate exactly ${actualEnd - actualStart + 1} entries, numbered ${actualStart} through ${actualEnd}. Make each day build naturally on the previous ones.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    let text = message.content[0].type === "text" ? message.content[0].text : "";

    // Strip markdown code fences if present
    text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate reading plan. Please try again." },
      { status: 500 }
    );
  }
}
