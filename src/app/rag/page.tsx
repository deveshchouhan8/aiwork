
"use client";

import { useState } from "react";

type ProcessedDocument = {
  fileName: string;
  textLength: number;
  chunkCount: number;
  chunks: string[];
};

export default function RagPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [searchError, setSearchError] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>){
        const selected = Array.from(event.target.files ?? []);
        setFiles(selected);
        setDocuments([]);
        setError("");
    }

    async function handleProcessDocuments() {
        if (files.length === 0) {
            setError("Please select at least one PDF or TXT file.");
            return;
        }

        const formData = new FormData();

        files.forEach((file) => {
        formData.append("files", file);
        });

        setIsLoading(true);
        setError("");
        setDocuments([]);

        try {     
            const response = await fetch("/api/rag/process", {
                method: "POST",
                body: formData,
            });
            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } 
            catch {
                console.error("Invalid API response:", responseText);
                throw new Error(`API returned an invalid response. Status: ${response.status}`);
            }
            if (!response.ok) {
                throw new Error(data.error || "Document processing failed.");
            }

            setDocuments(data.documents);
        } 
        catch (err){
            setError(
                err instanceof Error
                ? err.message
                : "Something went wrong."
            );
        } 
        finally {
            setIsLoading(false);
        }
    }

    
    async function handleAskQuestion() {
      setSearchError("");
      setAnswer("");

      if (!question.trim()) {
        setSearchError("Please enter a question.");
        return;
      }

      setIsSearching(true);

      try {
        const response = await fetch("/api/rag/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Search failed.");
        }

        setAnswer(data.answer);
       
      } catch (error) {
        setSearchError(
          error instanceof Error
            ? error.message
            : "Something went wrong."
        );
      } finally {
        setIsSearching(false);
      }
    }


  return (
    <main className="mx-auto w-full max-w-5xl flex-1 p-6 md:p-10">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-blue-600">
          AI WORKSPACE / RAG
        </p>

        <h1 className="text-3xl font-bold text-gray-900">
          RAG Document Assistant
        </h1>

        <p className="mt-3 text-gray-600">
          Upload documents, extract text, and split it into chunks.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Upload documents
        </h2>

        <input
          type="file"
          accept=".pdf,.txt"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700"
        />

        {files.length > 0 && (
          <p className="mt-3 text-sm text-gray-600">
            {files.length} file(s) selected
          </p>
        )}

        <button
          type="button"
          onClick={handleProcessDocuments}
          disabled={isLoading || files.length === 0}
          className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Processing documents..." : "Process Documents"}
        </button>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {error}
          </p>
        )}
      </section>

      {documents.length > 0 && (
        <section className="mt-8 space-y-5">
          <h2 className="text-xl font-bold text-gray-900">
            Processing Results
          </h2>

          {documents.map((document) => (
            <article
              key={document.fileName}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <h3 className="font-semibold text-gray-900">
                {document.fileName}
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Extracted characters: {document.textLength}
              </p>

              <p className="text-sm text-gray-600">
                Total chunks: {document.chunkCount}
              </p>

              <div className="mt-4 space-y-3">
                {document.chunks.map((chunk, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-gray-50 p-4"
                  >
                    <p className="mb-2 text-xs font-semibold uppercase text-blue-600">
                      Chunk {index + 1}
                    </p>

                    <p className="whitespace-pre-wrap break-words text-sm text-gray-700">
                      {chunk}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
<section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
  <h2 className="text-xl font-bold text-gray-900">
    Ask Your Documents
  </h2>

  <p className="mt-2 text-sm text-gray-600">
    Ask a question about the uploaded PDF or TXT documents.
  </p>

  <textarea
    value={question}
    onChange={(event) => setQuestion(event.target.value)}
    placeholder="Example: Who helps patients stay healthy?"
    rows={3}
    className="mt-4 w-full rounded-lg border border-gray-300 p-3 text-sm"
  />

  <button
    type="button"
    onClick={handleAskQuestion}
    disabled={isSearching}
    className="mt-3 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
  >
    {isSearching ? "Searching..." : "Ask Question"}
  </button>

  {searchError && (
    <p role="alert" className="mt-4 text-sm text-red-600">
      {searchError}
    </p>
  )}

  {answer && (
    <div className="mt-5 rounded-lg bg-gray-50 p-4">
      <h3 className="font-semibold text-gray-900">Answer</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
        {answer}
      </p>
    </div>
  )}

</section>
    
    </main>
  );
}
