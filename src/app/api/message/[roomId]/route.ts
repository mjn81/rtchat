import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import {
	getMessageValidator,
} from '@/lib/validations/message';
import { getServerSession } from 'next-auth';
import { ZodError, z } from 'zod';
import { getChatRoomMessages } from '@/helpers/query/message';

type Query = {
	params: {
		roomId: string;
	};
};

export async function GET(
	req: Request,
	{ params: { roomId: invalidRoomId } }: Query
) {
	const session = await getServerSession(authOptions);
	if (!session) return new Response('Unauthorized', { status: 401 });
	// get cursor and limit from query params
	const url = new URL(req.url);
	const cursorParam = url.searchParams.get('cursor');
	const limitParam = url.searchParams.get('limit');
	const invalidCursor = cursorParam ? cursorParam : undefined;
	const invalidLimit = limitParam ? Number(limitParam) : undefined;
	try {
		const { roomId, cursor, limit } = getMessageValidator.parse({
			roomId: invalidRoomId,
			cursor: invalidCursor,
			limit: invalidLimit,
		});
		const messages = await getChatRoomMessages({
			roomId,
			limit,
			cursor,
		});

		return Response.json(messages, { status: 200 });
	} catch (error) {
		if (error instanceof ZodError) {
			return new Response('Invalid request payload', { status: 400 });
		}
		console.log(error)
		return new Response('Something went wrong. Try again later.', {
			status: 500,
		});
	}
}
