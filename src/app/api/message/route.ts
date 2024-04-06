import { Message, chatRooms, messages } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { push } from "@/lib/utils";
import { messageValidator } from "@/lib/validations/message";
import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
		const body = await req.json();
		const { chatRoomId, text, type} = messageValidator.parse(body);

		const session = await getServerSession(authOptions);
		if (!session) {
			return new Response('Unauthorized', { status: 401 });
		}

		// get room
		const chatRoomDetails = await db?.query.chatRooms.findFirst({
			columns: {
				id: true,
			},
			where: (requests) =>
				and(
					eq(requests.id, chatRoomId),
				),
		});

		if (!chatRoomDetails) {
			return new Response('Room/Chat does not exist', {
				status: 400,
			});
		}
    const id = uuidv4();
    const message = await db
			?.insert(messages)
			.values({
				chatRoomId,
				text,
				type,
				id,
				sender: session.user.id,
			})
      .returning();
    
		if (!message) {
			throw new Error('something went wrong!')
    }
    // realtime messaging
    await push(message[0], chatRoomId);
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


// admin removes room
export async function Delete(req: Request) {
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
        status: 422
      })
    }

    return new Response('Invalid request.', {
      status: 400
    })

  }
}