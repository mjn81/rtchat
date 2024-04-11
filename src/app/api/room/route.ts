import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { chatRooms  } from "@/db/schema";
import { addMembersToChatRoom, generateChatRoomUrl } from "@/helpers/query/chatRoom";
import {
	createRoomValidator,
	updateRoomValidator,
} from '@/lib/validations/room';
import { deleteRoomEventListener, push, updateRoomEventListener } from "@/lib/utils";

// no realtime needed
// create room
export async function POST(req: Request) {
  try {
		const body = await req.json();
		const { name, url } = createRoomValidator.parse(body);

		const session = await getServerSession(authOptions);
		if (!session) {
			return new Response('Unauthorized', { status: 401 });
		}

		let id: string | null = null;
		// url exists
		if (url) {
			const doesUrlExist = await db.query.chatRooms.findFirst({
				columns: {
					id: true,
				},
				where: (requests) => eq(requests.url, url),
			});

			if (doesUrlExist) {
				return new Response('Url already exists', { status: 400 });
			}

			// create a chat room
			const chatRoomIdRaw = await db.insert(chatRooms).values({
				creatorId: session.user.id,
				name: name,
				url: url,
			}).returning({id: chatRooms.id});
			id = chatRoomIdRaw[0].id;
		}
		else {
			const url = generateChatRoomUrl(name);
			// create a chat room
			const chatRoomIdRaw = await db.insert(chatRooms).values({
				creatorId: session.user.id,
				name: name,
				url: url,
			}).returning({
				id: chatRooms.id,
			});
			id = chatRoomIdRaw[0].id;
		}

		// add the user to the chat room
		await addMembersToChatRoom(id, [session.user.id]);
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

// realtime complete
// admin removes room
export async function DELETE(req: Request) {
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
					eq(requests.creatorId, session.user.id)
				),
		});

		if (!toRemoveRoom) {
			return new Response('Room does not exist', {
				status: 400,
			});
		}
		
		await db.delete(chatRooms).where(eq(chatRooms.id, idToRemove));

		await push('DONE!',deleteRoomEventListener(idToRemove))

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
// realtime complete
// update room
export async function PUT(req: Request) {
	try {
		const body = await req.json();
		const { name, id: idToUpdate } = updateRoomValidator.parse(body);

		const session = await getServerSession(authOptions);
		if (!session) {
			return new Response('Unauthorized', { status: 401 });
		}

		const roomToUpdate = await db.query.chatRooms.findFirst({
			columns: {
				id: true,
			},
			where: (requests) =>
				and(
					eq(requests.creatorId, session.user.id),
					eq(requests.id, idToUpdate)
				),
		});

		if (!roomToUpdate) {
			return new Response('Room does not exist', {
				status: 400,
			});
		}

		await db
			.update(chatRooms)
			.set({
				name,
				updatedAt: new Date(),
			})
			.where(eq(chatRooms.id, idToUpdate));

		await push({
			name,
		},updateRoomEventListener(idToUpdate))
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