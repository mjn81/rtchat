import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { chatRoomMembers, chatRooms } from "@/db/schema";


// member leaves
export async function Delete(req: Request) {
  try {
		const body = await req.json();
		const { id: idToRemove } = z.object({ id: z.string() }).parse(body);

		const session = await getServerSession(authOptions);
		if (!session) {
			return new Response('Unauthorized', { status: 401 });
		}

		// get room
		const toRemoveRoom = await db.query.chatRooms.findFirst({
			columns: {
				id: true,
				creatorId: true,
			},
			where: (requests) =>
				and(
					eq(requests.id, idToRemove),
				),
		});

		if (!toRemoveRoom) {
			return new Response('Room does not exist', {
				status: 400,
			});
		}

		const isRoomJoined = await db.query.chatRoomMembers.findFirst({
			where: (requests) =>
				and(
					eq(requests.userId, session.user.id),
					eq(requests.chatRoomId, idToRemove)
				),
		});

		if (!isRoomJoined) {
			return new Response('Room does not exist', {
				status: 400,
			});
		}
		
		await db
			.delete(chatRoomMembers)
			.where(
				and(
					eq(chatRoomMembers.userId, session.user.id),
					eq(chatRoomMembers.chatRoomId, idToRemove)
				)
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