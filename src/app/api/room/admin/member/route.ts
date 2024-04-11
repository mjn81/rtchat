import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { chatRoomMemberStatus, chatRoomMembers, chatRooms } from "@/db/schema";
import { removeUserValidator } from "@/lib/validations/room";
import { changeRoomUserEventListener, deleteUserEventListener, push } from "@/lib/utils";

// realtime complete
// admin removes member
export async function DELETE(req: Request) {
	try {
		const body = await req.json();
		const { id: idToRemove, memberId } = removeUserValidator.parse(body);

		const session = await getServerSession(authOptions);
		if (!session) {
			return new Response('Unauthorized', { status: 401 });
		}

		// get room
		const roomToRemoveMember = await db.query.chatRooms.findFirst({
			columns: {
				id: true,
				creatorId: true,
			},
			where: (requests) =>
				and(
					eq(requests.id, idToRemove),
					eq(requests.creatorId, session.user.id)
				),
		});

		if (!roomToRemoveMember) {
			return new Response('Room does not exist', {
				status: 400,
			});
		}

		const isRoomJoined = await db.query.chatRoomMembers.findFirst({
			columns: {
				chatRoomId: true,
				userId: true,
			},
			where: (requests) =>
				and(
					eq(requests.userId, memberId),
					eq(requests.chatRoomId, idToRemove)
				),
		});

		if (!isRoomJoined) {
			return new Response('Member does not exist', {
				status: 400,
			});
		}
		
		await db
			.update(chatRoomMembers)
			.set({
				status: chatRoomMemberStatus.enumValues[1]
			})
			.where(
				and(
					eq(chatRoomMembers.userId, memberId),
					eq(chatRoomMembers.chatRoomId, idToRemove)
				)
		);
		
		await push(
			{ roomId: roomToRemoveMember.id, memberId },
			deleteUserEventListener(memberId)
		);

		await push(
			{ roomId: roomToRemoveMember.id, memberId },
			changeRoomUserEventListener(roomToRemoveMember.id)
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