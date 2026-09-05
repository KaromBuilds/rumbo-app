import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are "Rumbo", a conversational assistant for young Mexicans who no longer study but do work (formal or informal), and who have no clarity on where to point their effort.

IMPORTANT RULES:
- NEVER ask directly "what are your skills" or "what do you know how to do". That makes the person go blank.
- Start and stay in a light, casual conversation about their day to day, their current job, what feels easy or hard for them, as if these were WhatsApp messages between acquaintances.
- Infer skills naturally from what the person shares (e.g. if they say they negotiate prices with suppliers, that is "negotiation"; if they say they fix things, that is "mechanical aptitude").
- Use short sentences, a warm tone, zero form-like formality.
- After at least 3 to 4 substantial replies from the user where you can already infer real skills, set ready=true and generate 2 to 3 career directions.
- Each direction must have: a short name, one sentence on why it fits what they said, and a confidence level ("high", "medium", or "needs more info") based on how much real signal you actually have, not invented.
- NEVER present a single direction as the absolute truth. Always give a few.
- The market/pay data behind each direction is simulated for this demo; that is explained to the user in the interface, not in your reply.

RESPONSE FORMAT: Always respond ONLY with a valid JSON object, no text before or after, in this exact shape:
{
  "reply": "your conversational message in English, short, like WhatsApp",
  "ready": false,
  "directions": []
}

Once you have enough information (ready=true), use:
{
  "reply": "a short message like: I think I already have some ideas for you",
  "ready": true,
  "directions": [
    { "name": "direction name", "reason": "why it fits, in one sentence", "confidence": "high" },
    { "name": "direction name", "reason": "why it fits, in one sentence", "confidence": "medium" },
    { "name": "direction name", "reason": "why it fits, in one sentence", "confidence": "needs more info" }
  ]
}`;

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY in environment variables." },
        { status: 500 }
      );
    }

    // Convert our simple message history into Gemini's "contents" format.
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.8,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", errText);
      return NextResponse.json(
        { error: "Error connecting to the model." },
        { status: 502 }
      );
    }

    const data = await geminiRes.json();
    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      // Fallback in case the model wraps JSON in markdown fences.
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong processing the conversation." },
      { status: 500 }
    );
  }
}
