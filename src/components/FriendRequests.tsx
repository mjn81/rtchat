'use client';
import { FriendRequest } from "@/db/schema";
import axios from "axios";
import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FC } from "react";
import { useEffect, useState } from "react";

type IncomingFriendRequest = {friendRequest: FriendRequest, user: User};
interface FriendRequestsProps {
  incomingFriendRequests: IncomingFriendRequest[];
  sessionId: string;
}
 
const FriendRequests: FC<FriendRequestsProps> = ({ sessionId, incomingFriendRequests }) => {
	const router = useRouter();
	const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
		incomingFriendRequests
	);

	useEffect(() => {
		// pusherClient.subscribe(
		// 	toPusherKey(`user:${sessionId}:${INCOMING_FRIEND_REQ}`)
		// );

		// const friendRequestHandler = (data: IncomingFriendRequest) => {
		// 	setFriendRequests((prev) => [...prev, data]);
		// }

		// pusherClient.bind(INCOMING_FRIEND_REQ, friendRequestHandler);

		// return () => {
		// 	pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:${INCOMING_FRIEND_REQ}`));
		// 	pusherClient.unbind(INCOMING_FRIEND_REQ, friendRequestHandler);
		// }
	}, [sessionId]);
	
	const acceptFriend = async (senderId: string) => {
		await axios.post('/api/friends/accept', {
			id: senderId,
		});

		setFriendRequests((prev) =>
			prev.filter((request) => request.friendRequest.fromUserId !== senderId)
		);

		router.refresh();
	};

	const denyFriend = async (senderId: string) => {
		await axios.post('/api/friends/deny', {
			id: senderId,
		});

		setFriendRequests((prev) =>
			prev.filter((request) => request.friendRequest.fromUserId !== senderId)
		);

		router.refresh();
	};
	return (
		<>
			{friendRequests.length === 0 ? (
				<p className="text-sm text-zinc-500">Noting to show here...</p>
			) : (
				friendRequests.map((request) => (
					<div
						key={request.friendRequest.fromUserId}
						className="flex gap-4 items-center"
					>
						<UserPlus className="text-black" />
						<p className="font-medium text-lg">{request.user.email}</p>
						<button
							onClick={() => acceptFriend(request.friendRequest.fromUserId)}
							aria-label="accept friend"
							className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md "
						>
							<Check className="font-semibold text-white w-3/4 h-3/4" />
						</button>
						<button
							onClick={() => denyFriend(request.friendRequest.fromUserId)}
							aria-label="deny friend"
							className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md "
						>
							<X className="font-semibold text-white w-3/4 h-3/4" />
						</button>
					</div>
				))
			)}
		</>
	);
}
 
export default FriendRequests;