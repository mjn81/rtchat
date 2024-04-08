'use client';
import { ChatRoom, Message } from '@/db/schema';
import { newMessageEventListener, newRoomEventListener } from '@/lib/utils';
import { useSocketStore } from '@/store/socket';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

interface SidebarChatListProps {
	initialChats: ChatRoom[];
	sessionId: string;
}

const SidebarChatList: FC<SidebarChatListProps> = ({ initialChats, sessionId }) => {
	const pathname = usePathname();
	const [chats, setChats] = useState<ChatRoom[]>(initialChats);
	const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
	const connect = useSocketStore((state) => state.connect);
	const disconnect = useSocketStore((state) => state.disconnect);
	useEffect(() => {
    if (pathname?.includes('chat')) {
			setUnseenMessages((prev) =>
				prev.filter((msg) => !pathname.includes(msg.chatRoomId))
			);
    }
	}, [pathname]);
	useEffect(() => {
		const socket = connect();
		const newMessageHandler = (data: Message) => {
			setUnseenMessages((prev) => [...prev, data]);
		};
		const newRoomHandler = (data: ChatRoom) => {
			setChats((prev) => [...prev, data]);
		};

		socket.on(newMessageEventListener(sessionId), newMessageHandler);
		socket.on(newRoomEventListener(sessionId), newRoomHandler);

		return () => {
			socket.removeListener(newMessageEventListener(sessionId), newMessageHandler);
			socket.removeListener(newRoomEventListener(sessionId), newRoomHandler);
			disconnect();
		};
	}, []);

	return (
		<ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
			{chats.sort().map((chat) => {
				const unseenMessagesCount = unseenMessages.filter(
					(unseen) => unseen.chatRoomId === chat.id && unseen.sender !== sessionId
				).length;
				return (
					<li key={chat.id}>
						<Link
							href={`/chat/${chat.id}`}
							className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
						>
							{chat.name}
							{unseenMessagesCount > 0 ? (
								<div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center ">
									{unseenMessagesCount}
								</div>
							) : null}
						</Link>
					</li>
				);
			})}
		</ul>
	);
};

export default SidebarChatList;
