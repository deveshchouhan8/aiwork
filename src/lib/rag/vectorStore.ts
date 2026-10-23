export type VectorDocument = {
  id: string;
  text: string;
  embedding: number[];
  source: string;
};

const vectorDocuments: VectorDocument[] = [];

export function addDocuments(documents: VectorDocument[]) {
  vectorDocuments.push(...documents);
}

export function getDocuments() {
  return vectorDocuments;
}

export function clearDocuments() {
  vectorDocuments.length = 0;
}


export function cosineSimilarity(
  a: number[],
  b: number[]
): number {
  if (a.length !== b.length || a.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return (
    dotProduct /
    (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
  );
}

export function searchSimilarDocuments(queryEmbedding: number[], topK: number = 3): (VectorDocument & { score: number })[] {
  return vectorDocuments
    .map((document) => ({
      ...document,
      score: cosineSimilarity(
        queryEmbedding,
        document.embedding
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(0, topK));
}
