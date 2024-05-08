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
		<a
			href="/chat/friends"
			className="relative text-gray-700 hover:text-primary lg:hover:bg-gray-50 group flex items-center max-lg:justify-center gap-x-3 rounded-md lg:p-2 lg:text-sm leading-6 font-semibold"
		>
			<div className=" text-muted-foreground lg:text-gray-400 lg:group-hover:border-primary lg:group-hover:text-primary flex lg:h-6 lg:w-6 shrink-0 items-center justify-center rounded-lg lg:border text-[0.625rem] font-medium lg:bg-white">
				<User className="w-6 h-6 sm:w-7 sm:h-7 lg:h-4 lg:w-4" />
			</div>
			<p className="truncate max-lg:hidden">Friend requests</p>

			{unseenRequestCount > 0 ? (
				<div className="max-lg:absolute max-lg:top-2 max-lg:left-4 rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600">
					{unseenRequestCount}
				</div>
			) : null}
		</a>
	);
}
 
export default FriendRequestSidebarOption;