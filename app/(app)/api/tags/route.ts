import { auth } from '@/app/(auth)/auth';
import { getAllTags } from '@/lib/db/queries';

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const tags = await getAllTags(session.user.id);
  return Response.json(tags, { status: 200 });
}
