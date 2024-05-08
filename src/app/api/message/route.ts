import { db } from '@/lib/db';
import { chatRoomMemberStatus, messages } from '@/db/schema';
import { authOptions } from '@/lib/auth';
import { chatEventListener, newMessageEventListener, push, pushGroup } from '@/lib/utils';
import { messageValidator } from '@/lib/validations/message';
import { and, eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { ExtendedMessage } from '@/types/types';

// realtime complete
export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { chatRoomId, text, type } = messageValidator.parse(body);

		const session = await getServerSession(authOptions);
		if (!session) {
			return new Response('Unauthorized', { status: 401 });
		}

		// get room
		const chatRoomDetails = await db?.query.chatRooms.findFirst({
			columns: {
				id: true,
			},
			where: (requests) => and(eq(requests.id, chatRoomId)),
		});

		if (!chatRoomDetails) {
			return new Response('Room/Chat does not exist', {
				status: 400,
			});
		}
		const message = await db
			?.insert(messages)
			.values({
				chatRoomId,
				text,
				type,
				sender: session.user.id,
			})
			.returning();

		if (!message) {
			throw new Error('something went wrong!');
		}
		// realtime messaging
		await push(message[0], chatEventListener(chatRoomId));
		const chatRoomMembers = (await db?.query.chatRoomMembers.findMany({
			columns: {
				userId: true,
			},
			where: (members) =>
				and(
					eq(members.chatRoomId, chatRoomId),
					eq(members.status, chatRoomMemberStatus.enumValues[0])
				),
		})) as { userId: string }[];

		const notifMessage: ExtendedMessage = {
			message: message[0],
			sender: session.user as User,
		};
		// send new Message event to all members of the chat room
		// send new Message event to all members of the chat room
		
		const newMessageEventListenerList = chatRoomMembers.map((member) => newMessageEventListener(member.userId));
		await pushGroup(
			notifMessage,
			newMessageEventListenerList
		);

		return Response.json(message[0], {
			status: 201,
		});

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

// not implemented
// delete message
export async function DELETE(req: Request) {
	try {
		const body = await req.json();
		const { id: idToRemove } = z.object({ id: z.string() }).parse(body);

		const session = await getServerSession(authOptions);
		if (!session) {
			return new Response('Unauthorized', { status: 401 });
		}

		// delete message
		await db?.delete(messages).where(eq(messages.id, idToRemove));

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
