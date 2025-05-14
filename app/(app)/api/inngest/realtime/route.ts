import { getSubscriptionToken } from '@inngest/realtime';
import { auth } from '@/app/(auth)/auth';
import { NextResponse } from 'next/server';
import { inngest } from '@/src/inngest/client';

// ex. /api/get-subscribe-token
export async function POST() {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = await getSubscriptionToken(inngest, {
    channel: `user:${session.user.id}`,
    topics: ['embed-file-status'],
  });

  return NextResponse.json({ token }, { status: 200 });
}
