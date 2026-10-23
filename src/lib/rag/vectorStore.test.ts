
import {
  addDocuments,
  clearDocuments,
  searchSimilarDocuments,
} from "./vectorStore";

const testDocuments = [
  {
    id: "1",
    text: "Doctors treat patients.",
    embedding: [1, 0],
    source: "test.txt",
  },
  {
    id: "2",
    text: "Cars run on roads.",
    embedding: [0, 1],
    source: "test.txt",
  },
];

clearDocuments();
addDocuments(testDocuments);

const results = searchSimilarDocuments([1, 0], 1);

console.log("Most relevant document:", results[0]?.text);
console.log("Similarity score:", results[0]?.score);

const secondResults = searchSimilarDocuments([0, 1], 1);

console.log(
  "Second query result:",
  secondResults[0]?.text
);

console.log(
  "Second similarity score:",
  secondResults[0]?.score
);