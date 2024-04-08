'use client'
import { changeFriendRequestStatusEventListener, friendRequestEventListener } from "@/lib/utils";
import { useSocketStore } from "@/store/socket";
import { User } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";
import { useEffect, useState } from 'react';

interface FriendRequestSidebarOptionProps {
  sessionId: string;
  initialUnseenRequestCount?: number;
}
 
const FriendRequestSidebarOption: FC<FriendRequestSidebarOptionProps> = ({
  sessionId,
  initialUnseenRequestCount = 0
}) => {
  const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
    initialUnseenRequestCount
  )
  const connect = useSocketStore((state) => state.connect); 
  const disconnect = useSocketStore((state) => state.disconnect); 
  useEffect(() => {
    const socket = connect();
    socket.on(friendRequestEventListener(sessionId), () => {
      setUnseenRequestCount((prev) => prev + 1);
    });
    socket.on(changeFriendRequestStatusEventListener(sessionId), () => {
      setUnseenRequestCount((prev) => {
        if (prev === 0) return prev;
        return prev - 1
      });
    });
    return () => {
      socket.removeListener(friendRequestEventListener(sessionId))
      socket.removeListener(changeFriendRequestStatusEventListener(sessionId));
      disconnect();
    };
	}, [sessionId]);
  return (
		<Link
			href="/chat/friends"
			className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
		>
			<div className="text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
				<User className="h-4 w-4" />
			</div>
      <p className="truncate">Friend requests</p>

      {unseenRequestCount > 0 ? <div className="rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600">
        {unseenRequestCount}
      </div> : null}
		</Link>
	);
}
 
export default FriendRequestSidebarOption;