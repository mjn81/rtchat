import { db } from '@/lib/db';
import FriendRequests from '@/components/FriendRequests';
import { friendRequestStatus, friendRequests, users } from '@/db/schema';
import { authOptions } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import type { FC } from 'react';

interface RequestsProps {}

const Requests: FC<RequestsProps> = async () => {
	const session = await getServerSession(authOptions);
	if (!session) notFound();

	const incomingFriendRequests = await db
		?.select()
		.from(friendRequests)
		.where(
			and(
				eq(friendRequests.toUserId, session.user.id),
				eq(friendRequests.status, friendRequestStatus.enumValues[0])
			)
		)
		.innerJoin(users, eq(friendRequests.fromUserId, users.id));

	return (
		<main>
			<h1 className="font-bold text-5xl mb-8">Add a friend</h1>
			<div className="flex flex-col gap-4">
				<FriendRequests
					sessionId={session.user.id}
					incomingFriendRequests={incomingFriendRequests ?? []}
				/>
			</div>
		</main>
	);
};

export default Requests;
