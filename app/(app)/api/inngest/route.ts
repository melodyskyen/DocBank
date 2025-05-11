import { serve } from 'inngest/next';
import { inngest } from '@/src/inngest/client';
import { embedFileOnUpload } from '@/src/inngest/ingest';

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    embedFileOnUpload,
    /* your functions will be passed here later! */
  ],
});
