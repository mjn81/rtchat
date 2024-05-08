import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import {  friendRequestStatus, messages } from "@/db/schema";
import { chatEventListener, createChatRoomForTwoFriends, push, pushGroup, requestFriendToJoinMessage } from "@/lib/utils";


export async function POST(req: Request) {
  try {
		const body = await req.json();
		const { url, userIdArray } = z
			.object({
				userIdArray: z.array(z.string()),
				url: z.string(),
			})
			.parse(body);

		const session = await getServerSession(authOptions);
		if (!session) {
			return new Response('Unauthorized', { status: 401 });
		}

		const roomToJoin = await db.query.chatRooms.findFirst({
			columns: {
				id: true
			},
			where: (chatRooms) => eq(chatRooms.url, url)
		})

		if (!roomToJoin) {
			return new Response('Room does not exist', {
				status: 400,
			});
		}

		const friends = await db.query.friendRequests.findMany({
			columns: {
				id: true,
			},
			where: (requests) => and(
				eq(requests.toUserId, session.user.id),
				eq(requests.status, friendRequestStatus.enumValues[1])
			),
		});

		if (!friends) {
			return new Response('No friend Exist', { status: 400 });
		}

		if (!userIdArray.every((uid) => friends.includes({ id: uid }))) { 
				return new Response('You Must be friend with user to invite', {
					status: 400,
				});
		}
		const baseURL = new URL(req.url).origin;
		const absoluteURL = `${baseURL}/join/${url}`
		const textToJoin = requestFriendToJoinMessage(absoluteURL)
	
		const invites: any[] = [];
		for (const userId of userIdArray) {
			invites.push({
				chatRoomId: createChatRoomForTwoFriends(session.user.id, userId),
				sender: session.user.id,
				text: textToJoin,
			});
		}
			
		const sentInvites = await db?.insert(messages).values(invites).returning();
		// realtime message push
		const chatEventListenerList = sentInvites.map((invite) => chatEventListener(invite.chatRoomId));
		
		await pushGroup(
			sentInvites,
			chatEventListenerList
		);

		return new Response('OK');
	} catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload.', {
        status: 422
      })
    }

    return new Response('Invalid request.', {
      status: 400
    })

  }
}