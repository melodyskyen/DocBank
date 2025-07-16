import { embed, tool } from 'ai';
import { PgVector } from '@mastra/pg';
import { z } from 'zod';
import type { Session } from 'next-auth';
import type { DataStreamWriter } from 'ai';
import { rerank } from '@mastra/rag';
import {createOpenAI} from "@ai-sdk/openai";

interface SearchKnowledgeBaseProps {
  session: Session;
  dataStream: DataStreamWriter;
}
const openai =  createOpenAI({
  // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
  apiKey: 'sk-8640b9894b214543b4f6e3a5c99d84c1',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});


export const searchKnowledgeBase = ({
  session,
  dataStream,
}: SearchKnowledgeBaseProps) =>
  tool({
    description: 'Search the knowledge base for relevant information',
    parameters: z.object({
      query: z.string(),
    }),
    execute: async ({ query }) => {
      // Convert query to embedding
      const { embedding } = await embed({
        value: query,
        model: openai.embedding('text-embedding-v4'),
      });

      // Query vector store
      const pgVector = new PgVector({
        connectionString: process.env.POSTGRES_URL as string,
      });
      const results = await pgVector.query({
        indexName: process.env.INDEX_NAME as string,
        queryVector: embedding,
        topK: 10,
        filter: {
          userId: session.user.id,
        },
      });

      // Re-rank the results
      const rerankedResults = await rerank(
        results,
        query,
        openai('qwen-max-latest'),
        {
          topK: 5
        }
      );
      console.log(rerankedResults);

      for (const result of rerankedResults) {
        dataStream.writeSource({
          id: result.result.id,
          url: result.result.metadata?.blobUrl,
          title: result.result.metadata?.title,
          sourceType: 'url',
          providerMetadata: result.result.metadata
        });
      }

      // TODO: Use another query as node parser to get relevant results
      return rerankedResults;
    },
  });
