import { friendRequestStatus, friendRequests } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { and, eq, or } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email: emailToAdd } = addFriendValidator.parse(body.email) 
    
    const idToAdd = (await db.query.users.findFirst({
      where: (requests) => eq(requests.email, emailToAdd),
      columns: {
        id: true,
      }
    }));
   
    if (!idToAdd) {
      return new Response('The requested user does not exist!', {
        status: 400
      });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', {
        status: 401
      })
    }

    if (idToAdd.id === session.user.id) {
      return new Response('You cannot add yourself as a friend!');
    }

    // check if user is already added
    const isAlreadyAdded = await db.query.friendRequests.findFirst({
      columns: {
        id: true,
      },
			where: (requests) =>
				and(
					eq(requests.fromUserId, session.user.id),
          eq(requests.toUserId, idToAdd.id),
          eq(requests.status, friendRequestStatus.enumValues[0])
				),
		});

    if (isAlreadyAdded) {
      return new Response('Already added this user!', {
        status: 400
      })
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
						eq(requests.toUserId, idToAdd.id),
						eq(requests.status, friendRequestStatus.enumValues[1])
					),
					and(
						eq(requests.fromUserId, idToAdd.id),
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
    
    // valid friend request here
  
    // pusherServer.trigger(
		// 	toPusherKey(`user:${idToAdd}:${INCOMING_FRIEND_REQ}`),
		// 	INCOMING_FRIEND_REQ,
		// 	{
		// 		senderId: session.user.id,
    //     senderEmail: session.user.email,
    //   },
		// );

    await db.insert(friendRequests).values({
      id: uuidv4(),
      fromUserId: session.user.id,
      toUserId: idToAdd.id,
      status: friendRequestStatus.enumValues[0],
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', { status: 422 });
    }
    return new Response('Invalid request', {
      status:400
    })
  }
}