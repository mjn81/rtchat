'use client';
import { friendRequestEventListener } from "@/lib/utils";
import { useSocketStore } from "@/store/socket";
import { IncomingFriendRequest } from "@/types/types";
import axios from "axios";
import { ArchiveX, Check, Ghost, UserPlus, X } from "lucide-react";
import type { FC } from "react";
import { useEffect, useState } from "react";

interface FriendRequestsProps {
  incomingFriendRequests: IncomingFriendRequest[];
  sessionId: string;
}
 
const FriendRequests: FC<FriendRequestsProps> = ({ sessionId, incomingFriendRequests }) => {
	const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
		incomingFriendRequests
	);
	const connect = useSocketStore((state) => state.connect);
	const disconnect = useSocketStore((state) => state.disconnect);
	useEffect(() => {
		const socket = connect();
		const onFriendRequest = (request: IncomingFriendRequest) => {
			setFriendRequests((prev) => [...prev, request]);
		}
		socket.on(friendRequestEventListener(sessionId), onFriendRequest);
		return () => {
			socket.removeListener(friendRequestEventListener(sessionId), onFriendRequest);
			disconnect();
		}
	}, [sessionId]);
	
	const acceptFriend = async (senderId: string) => {		
		await axios.post('/api/friends/accept', {
			id: senderId,
		});

		setFriendRequests((prev) =>
			prev.filter((request) => request.friendRequest.fromUserId !== senderId)
		);

	};

	const denyFriend = async (senderId: string) => {
		await axios.post('/api/friends/deny', {
			id: senderId,
		});

		setFriendRequests((prev) =>
			prev.filter((request) => request.friendRequest.fromUserId !== senderId)
		);

	};
	return (
		<>
			{friendRequests.length === 0 ? (
				<section className="text-lg flex my-20 flex-col items-center justify-center text-gray-400">
					<ArchiveX className="w-12 h-12" />
					Noting to show here...
				</section>
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