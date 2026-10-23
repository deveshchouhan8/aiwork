import { NextResponse } from "next/server";
import { extractText } from "unpdf";
import OpenAI from "openai";
import { addDocuments } from "@/lib/rag/vectorStore";

export const runtime = "nodejs";


const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey
  ? new OpenAI({ apiKey })
  : null;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 150;

function splitIntoChunks(text: string) {
  const cleanedText = text.replace(/\s+/g, " ").trim();

  if (!cleanedText) {
    return [];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < cleanedText.length) {
    const end = Math.min(
      start + CHUNK_SIZE,
      cleanedText.length
    );
    chunks.push(cleanedText.slice(start, end));
    if(end === cleanedText.length){
      break;
    }
    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Please upload at least one document." },
        { status: 400 }
      );
    }

    const results = [];

    for (const item of files) {
      if (!(item instanceof File)) {
        return NextResponse.json(
          { error: "Invalid file upload." },
          { status: 400 }
        );
      }

      const file = item;
      const fileName = file.name.toLowerCase();

      const isPdf = fileName.endsWith(".pdf");
      const isTxt = fileName.endsWith(".txt");

      if (!isPdf && !isTxt) {
        return NextResponse.json(
          { error: "Only PDF and TXT files are supported." },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${file.name} exceeds the 5 MB limit.` },
          { status: 400 }
        );
      }

      let text = "";

      if (isTxt) {
        text = await file.text();
      } else {
        const buffer = Buffer.from(
          await file.arrayBuffer()
        );

        
        const result = await extractText(new Uint8Array(buffer), {
            mergePages: true,
        });

        text = result.text;
      }

      if (!text.trim()) {
        return NextResponse.json(
          {
            error: `No readable text found in ${file.name}. Scanned PDFs may require OCR.`,
          },
          { status: 400 }
        );
      }

      const chunks = splitIntoChunks(text);
      if(!openai) {
        return NextResponse.json(
          { error: "OpenAI API key is not configured." },
          { status: 503 }
        );
      }
      const embeddingResult = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunks,
        });

        addDocuments(
        embeddingResult.data.map((item) => ({
            id: crypto.randomUUID(),
            text: chunks[item.index],
            embedding: item.embedding,
            source: file.name,
        }))
        );
    console.log("Embeddings generated:", embeddingResult.data.length);
    console.log("Vectors stored:", embeddingResult.data[0]?.embedding.length);
      results.push({
        fileName: file.name,
        textLength: text.length,
        chunkCount: chunks.length,
        chunks,
      });
    }

    return NextResponse.json({ documents: results });
  } catch (error) {
  console.error("RAG document processing error:", error);

  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "Unknown document processing error",
    },
    { status: 500 }
  );
}
}
