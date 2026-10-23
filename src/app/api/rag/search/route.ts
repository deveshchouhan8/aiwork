
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { searchSimilarDocuments } from "@/lib/rag/vectorStore";

export const runtime = "nodejs";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey
  ? new OpenAI({ apiKey })
  : null;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = body.question;

    if (
      typeof question !== "string" ||
      !question.trim()
    ) {
      return NextResponse.json(
        { error: "Please provide a question." },
        { status: 400 }
      );
    }
    if(!openai) {
        return NextResponse.json(
          { error: "OpenAI API key is not configured." },
          { status: 503 }
        );
      }
    const result = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });

    const queryEmbedding = result.data[0].embedding;

    const documents = searchSimilarDocuments(
      queryEmbedding,
      3
    );

    const context = documents.map((document) => document.text).join("\n\n");

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
            role: "system",
            content:
                "Answer the user's question using only the provided document context. If the answer is not present in the context, say you could not find the answer in the uploaded documents.",
            },
            {
            role: "user",
            content: `Document context:\n${context}\n\nQuestion: ${question}`,
            },
        ],
    });

    const answer = completion.choices[0]?.message.content ?? "Unable to generate an answer.";

    return NextResponse.json({
        question,
        answer,
        results: documents.map((document) => ({
            text: document.text,
            source: document.source,
            score: document.score,
        })),
    });
  } catch (error) {
    console.error("RAG search error:", error);

    return NextResponse.json(
      { error: "Unable to search documents." },
      { status: 500 }
    );
  }
}
