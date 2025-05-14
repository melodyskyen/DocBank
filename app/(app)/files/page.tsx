import { auth } from '../../(auth)/auth';
import { redirect } from 'next/navigation';
import FileManager from '@/components/file-manager/file-manager';
import { inngest } from '@/src/inngest/client';
import { getSubscriptionToken } from '@inngest/realtime';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  const token = await getSubscriptionToken(inngest, {
    channel: `user:${session.user.id}`,
    topics: ['embed-file-status'],
  });

  return <FileManager token={token} />;
}
