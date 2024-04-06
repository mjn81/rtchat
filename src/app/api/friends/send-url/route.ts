import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { and, eq, or } from "drizzle-orm";
import { Message, chatRooms, friendRequestStatus, friendRequests, messages } from "@/db/schema";
import { createChatRoomForTwoFriends, push, requestFriendToJoinMessage } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { addMembersToChatRoom, generateChatRoomUrl } from "@/helpers/query/chatRoom";


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
		const mid = uuidv4();
		const textToJoin = requestFriendToJoinMessage(url)
	
		const invites: any[] = [];
		for (const userId of userIdArray) {
			invites.push({
				chatRoomId: createChatRoomForTwoFriends(session.user.id, userId),
				sender: session.user.id,
				text: textToJoin,
				id: mid,
			});
		}
			
		const sentInvites = await db?.insert(messages).values(invites).returning();
		// realtime message push
		Promise.all(sentInvites.map(async (invite) => { 
			await push(invite, invite.chatRoomId);
		}))

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