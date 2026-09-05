"use client";

import { useState, useRef, useEffect } from "react";

const OPENING_MESSAGE =
  "Hey, I'm Rumbo. First off, tell me, how was your day? what are you up to at work right now?";

const CONFIDENCE_STYLES = {
  high: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  "needs more info": "bg-gray-100 text-gray-600",
};

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: OPENING_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [directions, setDirections] = useState(null);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, directions, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    // Basic input validation / length limit, per the security floor.
    if (text.length > 500) {
      setError("That message is too long, try something shorter.");
      return;
    }
    setError("");

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);

      if (data.ready && Array.isArray(data.directions)) {
        setDirections(data.directions);
      }
    } catch (e) {
      setError("Couldn't connect. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[85vh]">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
            R
          </div>
          <div>
            <p className="font-medium text-sm text-gray-900">Rumbo</p>
            <p className="text-xs text-gray-500">online</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                m.role === "assistant"
                  ? "bg-white border border-gray-200 self-start mr-auto rounded-bl-sm"
                  : "bg-blue-600 text-white self-end ml-auto rounded-br-sm"
              }`}
            >
              {m.content}
            </div>
          ))}

          {loading && (
            <div className="max-w-[60%] bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-gray-400">
              typing...
            </div>
          )}

          {directions && (
            <div className="space-y-2 pt-2">
              <p className="text-center text-xs text-gray-400">
                a few directions for you (market data simulated for this
                demo)
              </p>
              {directions.map((d, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-xl p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {d.name}
                    </p>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-md ${
                        CONFIDENCE_STYLES[d.confidence] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {d.confidence}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{d.reason}</p>
                </div>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {error && (
          <p className="text-xs text-red-600 px-4 py-1 bg-red-50">{error}</p>
        )}

        <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-200">
          <input
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
            placeholder="Type a message..."
            value={input}
            maxLength={500}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="text-blue-600 disabled:text-gray-300 font-medium text-sm px-2"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
