import { MDocument } from '@mastra/rag';

// Create document from text
const doc = MDocument.fromText(
  'This is a test document. It is a test document. It is a test document.',
);

// Split into chunks with metadata extraction
const chunks = await doc.chunk({
  strategy: 'recursive',
  
  extract: {
    summary: true, // Extract summaries with default settings
    keywords: true, // Extract keywords with default settings
  },
});

chunks.map((chunk) => {
  chunk.metadata.page = 1;
  chunk.metadata.title = 'Test Title';

  return chunk;
});

// Get processed chunks
const docs = doc.getDocs();
const texts = doc.getText();
const metadata = doc.getMetadata();

console.log(docs);
console.log(texts);
console.log(metadata);
console.log(chunks);


console.log('To embed', `Metadata: \n${JSON.stringify(chunks[0].metadata, null, 2)}\n\nText: \n${chunks[0].text}`);