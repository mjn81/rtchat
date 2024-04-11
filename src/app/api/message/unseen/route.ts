import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { createUnseenChatUserKey } from '@/lib/utils';
import { messageValidator } from '@/lib/validations/message';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

// no realtime needed
export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { chatRoomId } = z
			.object({
				chatRoomId: z.string(),
			})
			.parse(body);

		const session = await getServerSession(authOptions);
		if (!session) {
			return new Response('Unauthorized', { status: 401 });
		}

			await fetchRedis(
				'incr',
				createUnseenChatUserKey(chatRoomId, session.user.id)
			);
		
		return new Response('OK');
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response('Invalid request payload.', {
				status: 422,
			});
		}
		return new Response('Invalid request.', {
			status: 400,
		});
	}
}

// no realtime needed
// delete unseen
export async function DELETE(req: Request) {
	try {
		const body = await req.json();
		const { id: idToRemove } = z.object({ id: z.string() }).parse(body);
		const session = await getServerSession(authOptions);
		if (!session) {
			return new Response('Unauthorized', { status: 401 });
		}

    // delete key
    await fetchRedis('del',createUnseenChatUserKey(idToRemove, session.user.id));

		return new Response('OK');
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response('Invalid request payload.', {
				status: 422,
			});
		}

		return new Response('Invalid request.', {
			status: 400,
		});
	}
}

