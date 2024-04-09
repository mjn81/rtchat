import { friendRequestStatus, friendRequests } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { and, eq, or } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { friendRequestEventListener, push } from "@/lib/utils";
import { IncomingFriendRequest } from "@/types/types";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email: emailToAdd } = addFriendValidator.parse(body.email) 
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', {
        status: 401
      })
    }

     const userToAdd = await db.query.users.findFirst({
				where: (requests) => eq(requests.email, emailToAdd),
				columns: {
					id: true,
				},
			});

			if (!userToAdd) {
				return new Response('The requested user does not exist!', {
					status: 400,
				});
			}


    if (userToAdd.id === session.user.id) {
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
          eq(requests.toUserId, userToAdd.id),
          eq(requests.status, friendRequestStatus.enumValues[0])
				),
		});

    if (isAlreadyAdded) {
      return new Response('Already sent request to this user!', {
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
						eq(requests.toUserId, userToAdd.id),
						eq(requests.status, friendRequestStatus.enumValues[1])
					),
					and(
						eq(requests.fromUserId, userToAdd.id),
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

    const dbFriendRequest = await db.insert(friendRequests).values({
      fromUserId: session.user.id,
      toUserId: userToAdd.id,
      status: friendRequestStatus.enumValues[0],
    }).returning();
   
    const incomingRequest = {
      friendRequest: dbFriendRequest[0],
      user: {
        id: session.user.id,
        email: session.user.email ?? '',
        name: session.user.name ?? '',
        image: session.user.image ?? '',
        emailVerified: null,
      },
    } satisfies IncomingFriendRequest
    // realtime friend request push
    await push(
      incomingRequest,
      friendRequestEventListener(userToAdd.id)
    );
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