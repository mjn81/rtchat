import { getRedisClient } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { createUnseenChatUserKey } from '@/lib/utils';
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
		const redis = await getRedisClient();
		await redis.incr(createUnseenChatUserKey(chatRoomId, session.user.id));

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
		const redis = await getRedisClient();
		// delete key
		await redis.del(createUnseenChatUserKey(idToRemove, session.user.id));
		
		return new Response('OK');
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.log(error);
			return new Response('Invalid request payload.', {
				status: 422,
			});
		}

		return new Response('Invalid request.', {
			status: 400,
		});
	}
}
