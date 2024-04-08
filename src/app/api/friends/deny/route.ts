import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { and, eq, or } from 'drizzle-orm';
import { friendRequestStatus, friendRequests } from '@/db/schema';
import { changeFriendRequestStatusEventListener, push } from '@/lib/utils';

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { id: idToAdd } = z.object({ id: z.string() }).parse(body);

		const session = await getServerSession(authOptions);
		if (!session) {
			return new Response('Unauthorized', { status: 401 });
		}

		// already friends
		const isAlreadyFriends = await db.query.friendRequests.findFirst({
			columns: {
				id: true,
			},
			where: (requests) =>
				or(
					and(
						eq(requests.fromUserId, session.user.id),
						eq(requests.toUserId, idToAdd),
						eq(requests.status, friendRequestStatus.enumValues[1])
					),
					and(
						eq(requests.fromUserId, idToAdd),
						eq(requests.toUserId, session.user.id),
						eq(requests.status, friendRequestStatus.enumValues[1])
					)
				),
		});

		if (isAlreadyFriends) {
			return new Response('Already friends with this user', {
				status: 400,
			});
		}

		const hasFriendRequest = await db.query.friendRequests.findFirst({
			columns: {
				id: true,
			},
			where: (requests) =>
				and(
					eq(requests.fromUserId, idToAdd),
					eq(requests.toUserId, session.user.id),
					eq(requests.status, friendRequestStatus.enumValues[0])
				),
		});

		if (!hasFriendRequest) {
			return new Response('No friend request', { status: 400 });
		}

		// deny friend
		await db
			.update(friendRequests)
			.set({
				status: friendRequestStatus.enumValues[2],
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(friendRequests.fromUserId, idToAdd),
					eq(friendRequests.toUserId, session.user.id),
					eq(friendRequests.status, friendRequestStatus.enumValues[0])
				)
			);

		// push notification to friend status change
		await push(
			{ status: 'deny' },
			changeFriendRequestStatusEventListener(session.user.id)
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
