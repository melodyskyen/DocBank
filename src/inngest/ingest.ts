import { updateManagedFile } from '@/lib/db/queries';
import { inngest } from './client';
import { MDocument } from '@mastra/rag';
import { openai } from '@ai-sdk/openai';
import { embedMany, generateObject } from 'ai';
import { store as vectorStore } from '@/lib/db/vector-store'; // Use your configured store
import { z } from 'zod';
import * as pdfjsLib from 'pdfjs-dist';
import { TAXONOMY_SCHEMA } from '@/lib/business/taxonomy';

// Define the event payload type for clarity
interface FileEmbedRequestedEvent {
  name: 'file/embed.requested';
  data: {
    managedFileId: string;
    name: string;
    blobUrl: string;
    blobDownloadUrl: string;
    mimeType: string;
  };
}

export const embedFileOnUpload = inngest.createFunction(
  { id: 'embed-file-on-upload', name: 'Embed File on Upload' },
  { event: 'file/embed.requested' as FileEmbedRequestedEvent['name'] }, // Type assertion for event name
  async ({ event, step }) => {
    const { managedFileId, name, blobUrl, blobDownloadUrl, mimeType } =
      event.data;

    // Check mimeType
    if (
      !mimeType.startsWith('text/') &&
      !mimeType.startsWith('application/pdf')
    ) {
      console.warn(
        `Unsupported mimeType for embedding: ${mimeType}. Skipping embedding for file ${managedFileId}`,
      );
      return { success: false, message: 'Unsupported mimeType' };
    }

    let fileContentText: string[];
    try {
      const response = await fetch(blobUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch file from blob: ${response.statusText}`,
        );
      }
      const fileBuffer = await response.arrayBuffer();

      if (mimeType === 'application/pdf') {
        const loadingTask = pdfjsLib.getDocument(fileBuffer);
        const pdf = await loadingTask.promise;

        const pages: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => item.str);
          pages.push(strings.join(' '));
        }
        fileContentText = pages;
      } else if (mimeType.startsWith('text/')) {
        fileContentText = [new TextDecoder().decode(fileBuffer)];
      } else {
        // For other binary types (images, docx, etc.), text extraction is more complex.
        // Mastra's MDocument might handle some directly, or you might need specific parsers.
        // For now, we'll log and skip embedding for unsupported types if not plain text/pdf.
        console.warn(
          `Unsupported mimeType for direct text extraction: ${mimeType}. Skipping embedding for file ${managedFileId}`,
        );
        // Update status to reflect it won't be embedded if no text could be extracted.
        // Or, you could mark as requiring manual attention.
        // For this example, we won't update to isEmbedded = true if we can't process.
        return {
          success: false,
          message: `Unsupported mimeType for text extraction: ${mimeType}`,
        };
      }
    } catch (error) {
      console.error(
        `Error fetching or parsing file ${managedFileId} from ${blobUrl}:`,
        error,
      );
      return {
        success: false,
        message: `Error processing file: ${error instanceof Error ? error.message : String(error)}`,
      };
    }

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        summary: z.string(),
        tags: z.array(TAXONOMY_SCHEMA),
      }),
      prompt: `Extract the summary and tags from the following text: ${fileContentText.join('\n')}`,
    });
    const { summary, tags } = object;

    for (let i = 0; i < fileContentText.length; i++) {
      const page = fileContentText[i];
      const doc = MDocument.fromText(page); // Use fromText after extraction
      const chunks = await step.run('chunk-document', async () => {
        return doc.chunk({
          strategy: 'recursive', // Or other strategies as appropriate
          size: 512,
          overlap: 50,
          separator: '\n', // Default is fine
          extract: {
            title: true,
            questions: true,
            keywords: true,
            summary: true,
          }, // If you want Mastra to extract metadata (may use LLM)
        });
      });
      if (!chunks || chunks.length === 0) {
        console.warn(
          `No chunks generated for file ${managedFileId}. Skipping embedding.`,
        );
        // Potentially update status to reflect this, or log for review
        return { success: false, message: 'No chunks generated' };
      }

      const { embeddings } = await step.run('generate-embeddings', async () => {
        return embedMany({
          values: chunks.map((chunk) => chunk.text),
          model: openai.embedding('text-embedding-3-small', {
            dimensions: 1536,
          }), // Ensure dimensions match pgVector setup
        });
      });

      await step.run('upsert-embeddings', async () => {
        // USER ACTION REQUIRED: Verify this structure against Mastra PgVector client docs.
        // The linter error indicates `vectors` might need to be `number[][]` and metadata passed differently.
        return vectorStore.upsert({
          indexName: 'document-embeddings', // Ensure this index exists and matches dimensions
          vectors: embeddings,
          metadata: chunks.map((chunk) => ({
            text: chunk.text,
            page: i, // 0 based index
            fileId: managedFileId,
            fileName: name,
            blobDownloadUrl: blobDownloadUrl,
            blobUrl: blobUrl,
            mimeType: mimeType,
            ...chunk.metadata,
          })),
        });
      });
    }

    await step.run('update-db-status', async () => {
      return updateManagedFile({
        id: managedFileId,
        isEmbedded: true,
        aiSummary: summary,
        tags,
      });
    });

    return {
      success: true,
      message: `File ${managedFileId} processed and embedded.`,
    };
  },
);