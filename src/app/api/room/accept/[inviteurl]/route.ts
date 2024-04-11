import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { and, eq, or } from 'drizzle-orm';
import { addMembersToChatRoom } from '@/helpers/query/chatRoom';
import { chatRoomMemberStatus, chatRoomMembers } from '@/db/schema';
import { joinedEventListener, push } from '@/lib/utils';

// realtime complete
export async function GET(
	req: Request,
	{ params }: { params: { inviteurl: string } }
) {
	try {
		const url = params.inviteurl;
		const session = await getServerSession(authOptions);
		if (!session) {
			return new Response('Unauthorized', { status: 401 });
		}

		const doesRoomExist = await db.query.chatRooms.findFirst({
			columns: {
				id: true,
			},
			where: (requests) => eq(requests.url, url),
		});

		if (!doesRoomExist) {
			return new Response('Room does not exist', {
				status: 400,
			});
		}
		const alreadyMember = await db.query.chatRoomMembers.findFirst({
			where: (room) => and(eq(room.userId, session.user.id),eq(room.chatRoomId, doesRoomExist.id))
		})

		if (
			!!alreadyMember
		) {
			if ( alreadyMember.status === chatRoomMemberStatus.enumValues[0]) {
				return new Response('Already Member of this room', {
					status: 400,
				});
			}

			if (alreadyMember.status === chatRoomMemberStatus.enumValues[1]) {
				await db
					.update(chatRoomMembers)
					.set({
						status: chatRoomMemberStatus.enumValues[0],
					})
					.where(
						and(
							eq(chatRoomMembers.userId, session.user.id),
							eq(chatRoomMembers.chatRoomId, doesRoomExist.id)
						)
					);
			}
		} else {
			// add user to the chat room
			await addMembersToChatRoom(doesRoomExist.id, [session.user.id]);
		}

		await push(session.user, joinedEventListener(doesRoomExist.id));

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
