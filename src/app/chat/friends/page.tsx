import { db } from '@/lib/db';
import FriendRequests from '@/components/FriendRequests';
import { friendRequestStatus, friendRequests, users } from '@/db/schema';
import { authOptions } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import type { FC } from 'react';
import { ChevronLeft } from 'lucide-react';
import BackButton from '@/components/BackButton';

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
			<section className="flex gap-2 items-center mb-8">
				<BackButton />
				<h1 className="font-bold text-sm sm:text-lg md:text-2xl lg:text-5xl">Accept friend requests</h1>
			</section>
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
