'use client';
import { ChatRoom, Message } from '@/db/schema';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

interface SidebarChatListProps {
	chats: ChatRoom[];
	sessionId: string;
}

const SidebarChatList: FC<SidebarChatListProps> = ({ chats, sessionId }) => {
	const router = useRouter();
  const pathname = usePathname();
  const [currentChatRoomId, setCurrentChatRoomId] = useState<string | null>(null);
	const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
	useEffect(() => {
    if (pathname?.includes('chat')) {
      const chatRoomId = pathname.split('/').pop();
      if (chatRoomId) {
        setCurrentChatRoomId(chatRoomId ?? null);
      }
			setUnseenMessages((prev) =>
				prev.filter((msg) => !pathname.includes(msg.chatRoomId))
			);
    }
	}, [pathname]);

	useEffect(() => {

		const newMessageHandler = (data: Message) => {};
		const newFriendHandler = (data: User) => {
			router.refresh();
		};

		return () => {
		};
	}, []);

	return (
		<ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
			{chats.sort().map((chat) => {
				const unseenMessagesCount = unseenMessages.filter(
					(unseen) => unseen.sender === sessionId && unseen.chatRoomId !== currentChatRoomId
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
