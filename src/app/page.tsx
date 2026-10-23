
"use client";
import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  async function handleSend() {
    const text = input.trim();
    if (!text){
     // alert("Enter your data");
      return;
    } 
    setError("");
    setInput("");
    setIsLoading(true);

    //console.log(previousMessages);
  const updatedMessages: Message[] = [
    ...messages,
    { role: "user", content: text },
  ];
  setMessages(updatedMessages);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });
      const data= await response.json();
       if(!response.ok){
          throw new Error(data.error || "Something went wrong.");
        }
        setMessages((previousMessages) => [
          ...previousMessages,
          { role: "assistant", content: data.reply },
        ]);
    }
    catch {
      setError("Unable to get a response. Please try again.");
    } finally {
    setIsLoading(false);
  }

    setInput("");
  }

  return (
    <main className="mx-auto flex min-90h bg-white max-w-3xl flex-col p-6">
      <h1 className="mb-2 text-3xl font-bold">
        AI Chat Assistant
      </h1>

      <p className="mb-6 text-gray-500">Ask a question and start a conversation.</p>

      <section className="mb-4 flex-1 space-y-4 rounded-xl border p-4" aria-live="polite" >
        {messages.length === 0 && (
          <p className="text-gray-400">
            Your conversation will appear here.
          </p>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`rounded-lg p-3 ${
              message.role === "user"
                ? "ml-8 bg-blue-100 text-blue-950"
                : "mr-8 bg-gray-100 text-gray-900"
            }`}
          >
            <strong>
              {message.role === "user" ? "You" : "AI"}:
            </strong>{" "}
            {message.content}
          </div>
        ))}
      </section>

      <form className="flex gap-2" onSubmit={(event) => {event.preventDefault(); handleSend();}} >
        <input className="min-w-0 flex-1 rounded-lg border p-3" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type your question..." aria-label="Your question" />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
        >
          {isLoading ? "Thinking..." : "Send"}
        </button>
        {error && <p className="flex mt-2 text-red-600">{error}</p>}
      </form>
    </main>
  );
}
